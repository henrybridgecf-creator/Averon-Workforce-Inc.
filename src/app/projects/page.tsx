'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Upload,
  File,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Project } from '@/types';

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadBudget, setUploadBudget] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('assignedTo', 'array-contains', user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => doc.data() as Project);
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadTitle || !uploadDescription || !uploadBudget) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      let fileUrl = '';
      let fileName = '';

      if (uploadFile) {
        const storageRef = ref(storage, `projects/${user!.uid}/${Date.now()}_${uploadFile.name}`);
        await uploadBytes(storageRef, uploadFile);
        fileUrl = await getDownloadURL(storageRef);
        fileName = uploadFile.name;
      }

      const newProject: Project = {
        id: '',
        title: uploadTitle,
        description: uploadDescription,
        budget: parseFloat(uploadBudget),
        status: 'pending',
        category: 'general',
        deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        uploadedBy: user!.uid,
        fileUrl,
        fileName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const projectsRef = collection(db, 'projects');
      await addDoc(projectsRef, newProject);

      toast({
        title: 'Success',
        description: 'Project uploaded successfully',
      });

      setUploadTitle('');
      setUploadDescription('');
      setUploadBudget('');
      setUploadFile(null);
      setShowUploadForm(false);

      // Refresh projects
      const snapshot = await getDocs(collection(db, 'projects'));
      const data = snapshot.docs.map((doc) => doc.data() as Project);
      setProjects(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload project',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-white">Loading projects...</div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020817]">
      {/* Header */}
      <header className="bg-[#050f26] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-primary hover:bg-primary/90"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Project
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-[#050f26] border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Upload New Project</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Website Design"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Describe your project..."
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Budget</label>
                <input
                  type="number"
                  value={uploadBudget}
                  onChange={(e) => setUploadBudget(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white file:bg-primary file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:cursor-pointer"
                  disabled={uploading}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>Upload Project</>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-[#050f26] border border-white/10 rounded-xl p-6 hover:border-primary/50 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex-1">{project.title}</h3>
                {getStatusIcon(project.status)}
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-primary">
                  ${project.budget.toLocaleString()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-muted-foreground capitalize">
                  {project.status}
                </span>
              </div>

              {project.fileName && (
                <div className="p-3 bg-white/5 rounded-lg flex items-center gap-2 mb-4">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{project.fileName}</span>
                </div>
              )}

              {project.fileUrl && (
                <Button
                  onClick={() => window.open(project.fileUrl, '_blank')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Download
                </Button>
              )}
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No projects yet. Upload one to get started!</p>
          </div>
        )}
      </main>
    </div>
  );
}
