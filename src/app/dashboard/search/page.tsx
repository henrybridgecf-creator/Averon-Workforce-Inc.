
'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Filter, Search as SearchIcon, XIcon } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { getInitials } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { projectsData } from '@/lib/mock-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [isLoading, setIsLoading] = useState(true);
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>(undefined);

  const filteredProjects = useMemo(() => {
    let projects = [];

    if (q) {
      projects = projectsData.filter(project => 
        project.title.toLowerCase().includes(q.toLowerCase())
      );
    } else {
        projects = [...projectsData];
    }

    if (dateRangeFilter?.from) {
      projects = projects.filter(p => {
        const deadline = p.submissionDeadline;
        if (!deadline) return false;
        // If only 'from' is selected, filter from that day onwards
        if (!dateRangeFilter.to) {
          return deadline >= dateRangeFilter.from;
        }
        // If both 'from' and 'to' are selected, filter within the range
        return deadline >= dateRangeFilter.from && deadline <= dateRangeFilter.to;
      });
    }

    return projects;
  }, [q, dateRangeFilter]);

  useEffect(() => {
    setIsLoading(true);
    // Simulate network delay
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [q, dateRangeFilter]);

  const clearFilters = () => {
    setDateRangeFilter(undefined);
  };

  const activeFilterCount = dateRangeFilter ? 1 : 0;

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Approved</Badge>;
      case "submitted":
         return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Submitted</Badge>;
      case "pending":
         return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Pending</Badge>;
      case "new":
        return <Badge className="bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-100">New</Badge>;
      case "requires-edits":
        return <Badge variant="destructive">Requires Edits</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };


  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Search Results</h2>
                {q && <p className="text-muted-foreground">
                    Showing results for: <span className="font-semibold text-primary">"{q}"</span>
                </p>}
            </div>
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRangeFilter?.from}
                        selected={dateRangeFilter}
                        onSelect={setDateRangeFilter}
                        numberOfMonths={1}
                    />
                     {activeFilterCount > 0 && (
                        <div className="p-4 pt-0">
                            <Button variant="ghost" onClick={clearFilters} className="w-full">
                                <XIcon className="mr-2 h-4 w-4" />
                                Clear Filter
                            </Button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Found {isLoading ? "..." : filteredProjects?.length || 0} Projects</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoading ? (
                        Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                    ) : filteredProjects && filteredProjects.length > 0 ? (
                        filteredProjects.map((project: any) => (
                            <div key={project.id} className="flex items-center p-3 bg-secondary/50 rounded-lg">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={`https://avatar.vercel.sh/${project.title}.png`} alt="Avatar" />
                                    <AvatarFallback>{getInitials(project.title)}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{project.title}</p>
                                    <p className="text-sm text-muted-foreground">Assigned to: ID {project.assignedTo.slice(0, 6)}...</p>
                                </div>
                                <div className="ml-auto font-medium text-right">
                                    <p>£{project.paymentAmount.toLocaleString()}</p>
                                    {getStatusBadge(project.status)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold">No Projects Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Your search {q && `for "${q}"`} did not match any projects. Try adjusting your filters.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

export default function SearchPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={<div>Loading search...</div>}>
                <SearchResults />
            </Suspense>
        </DashboardLayout>
    )
}
