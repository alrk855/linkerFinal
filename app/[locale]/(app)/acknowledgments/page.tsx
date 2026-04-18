"use client";

import { useAuth } from "@/providers/auth-provider";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, X, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MOCK_INCOMING = [
  { id: "1", type: "request", company: { name: "TechCorp", logo: "" }, role: "Frontend Engineering Intern", date: "2 hours ago", status: "pending" },
  { id: "2", type: "request", company: { name: "StartupApp", logo: "" }, role: "React Native Developer", date: "1 day ago", status: "pending" },
];

const MOCK_ACCEPTED = [
  { id: "3", type: "accepted", company: { name: "BigData Inc", logo: "" }, role: null, date: "1 week ago", status: "accepted", email: "recruiting@bigdatainc.com" },
];

export default function AcknowledgmentsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <div className="p-8">Loading...</div>;

  const StudentInbox = () => (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <PageHeader title="Inbox" description="Manage incoming connections and acknowledgments from companies." />
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 bg-surface border border-border">
          <TabsTrigger value="pending" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
            Pending Requests <span className="ml-2 bg-accent text-background text-[10px] px-1.5 py-0.5 rounded-full font-bold">2</span>
          </TabsTrigger>
          <TabsTrigger value="accepted" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
            Connections
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {MOCK_INCOMING.map(req => (
            <div key={req.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-4 items-start">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarFallback className="bg-background text-xs">{req.company.name.slice(0,2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-foreground">Acknowledgment Request from {req.company.name}</h3>
                  <p className="text-sm text-foreground-muted mt-1 leading-relaxed max-w-xl">
                    They matched with your anonymous profile based on skills required for <strong>{req.role}</strong> and would like to reveal your identity to discuss opportunities.
                  </p>
                  <span className="text-xs text-foreground-faint mt-2 block">{req.date}</span>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 bg-surface hover:bg-surface-raised border-border text-foreground">
                  <X size={16} className="mr-2" /> Decline
                </Button>
                <Button className="flex-1 bg-accent hover:bg-accent-hover text-background font-medium">
                  <Check size={16} className="mr-2" /> Accept
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="accepted" className="space-y-4">
           {MOCK_ACCEPTED.map(req => (
            <div key={req.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-4 items-center">
                <Avatar className="w-10 h-10 border border-border">
                 <AvatarFallback className="bg-background text-xs">{req.company.name.slice(0,2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-foreground">{req.company.name}</h3>
                  <p className="text-sm text-foreground-muted">Connected {req.date}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full sm:w-auto bg-background hover:bg-surface-raised border-border">
                <Mail size={16} className="mr-2" /> Message
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );

  const CompanyInbox = () => (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <PageHeader title="Sent Acknowledgments" description="Track the status of acknowledgment requests sent to candidates." />
      
      <div className="bg-surface border border-border rounded-xl p-1 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-background text-foreground-muted uppercase text-xs border-b border-border">
            <tr>
              <th className="px-5 py-4 font-medium">Candidate</th>
              <th className="px-5 py-4 font-medium">Purpose</th>
              <th className="px-5 py-4 font-medium">Date Sent</th>
              <th className="px-5 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="hover:bg-surface-raised transition-colors">
              <td className="px-5 py-4 text-foreground font-medium">Anonymous Student</td>
              <td className="px-5 py-4 text-foreground-muted">Frontend Engineering Intern</td>
              <td className="px-5 py-4 text-foreground-muted">2 hours ago</td>
              <td className="px-5 py-4"><span className="text-status-warning bg-status-warning/10 px-2 py-1 rounded text-xs font-medium border border-status-warning/20">Pending</span></td>
            </tr>
            <tr className="hover:bg-surface-raised transition-colors">
              <td className="px-5 py-4 text-foreground font-medium underline cursor-pointer">Jane Doe</td>
              <td className="px-5 py-4 text-foreground-muted">General Discovery</td>
              <td className="px-5 py-4 text-foreground-muted">3 days ago</td>
              <td className="px-5 py-4"><span className="text-success bg-success/10 px-2 py-1 rounded text-xs font-medium border border-success/20">Accepted</span></td>
            </tr>
            <tr className="hover:bg-surface-raised transition-colors">
              <td className="px-5 py-4 text-foreground font-medium">Anonymous Student</td>
              <td className="px-5 py-4 text-foreground-muted">DevOps Engineer</td>
              <td className="px-5 py-4 text-foreground-muted">1 week ago</td>
              <td className="px-5 py-4"><span className="text-destructive bg-destructive/10 px-2 py-1 rounded text-xs font-medium border border-destructive/20">Declined</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );


  return user.role === "student" ? <StudentInbox /> : <CompanyInbox />;
}
