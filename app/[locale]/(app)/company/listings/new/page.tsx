"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const listingSchema = z.object({
  title: z.string().min(5, "Title is too short").max(100, "Title is too long"),
  description: z.string().min(50, "Please provide a detailed description"),
  listing_type: z.string(),
  focus_area: z.string(),
  experience_level: z.string(),
  total_slots: z.coerce.number().min(1, "Must have at least 1 slot").max(20, "Maximum 20 slots"),
  // Skipped required skills for form validation simplicity in V1
});

export default function NewListingPage() {
  const router = useRouter();
  
  const form = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      listing_type: "Full-time",
      focus_area: "",
      experience_level: "Junior",
      total_slots: 1,
    },
  });

  const onSubmit = async (values: z.infer<typeof listingSchema>) => {
    try {
      // POST /api/listings ...
      toast.success("Listing published successfully.");
      router.push("/company/listings");
    } catch {
      toast.error("Failed to publish listing.");
    }
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
      <Card className="bg-surface border-border shadow-lg rounded-xl">
        <CardHeader className="border-b border-border-subtle pb-6 mb-6">
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">Post a New Listing</CardTitle>
          <CardDescription className="text-foreground-muted">Create a detailed listing to discover matched candidates.</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl><Input {...field} className="bg-background border-border" placeholder="e.g. Frontend Engineering Intern" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} className="bg-background border-border h-48" placeholder="Detailed job description, responsibilities, requirements..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="listing_type" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Role Type</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-3">
                        {["Internship", "Part-time", "Full-time"].map(t => (
                          <FormItem key={t} className="flex items-center space-x-2 space-y-0 bg-background border border-border px-4 py-3 rounded-md w-full">
                            <FormControl><RadioGroupItem value={t} /></FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full text-foreground hover:text-foreground">{t}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="experience_level" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Experience Level</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-3">
                        {["No experience", "Junior", "Mid-level", "Senior"].map(t => (
                          <FormItem key={t} className="flex items-center space-x-2 space-y-0 bg-background border border-border px-4 py-3 rounded-md w-full">
                            <FormControl><RadioGroupItem value={t} /></FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full text-foreground shrink-0">{t}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="focus_area" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Focus Area</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>Select area</option>
                        {["Frontend", "Backend", "Fullstack", "Mobile", "DevOps", "Data", "Other"].map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="total_slots" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Positions Available</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="20" {...field} className="bg-background border-border w-24" />
                    </FormControl>
                    <p className="text-xs text-foreground-muted mt-1">Number of distinct candidates you can acknowledge for this role.</p>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Skills multi-select would go here, simplified for UI mock */}
               <div className="space-y-2 pb-4">
                 <FormLabel>Required Skills</FormLabel>
                 <div className="p-4 border border-border rounded-lg bg-background text-sm text-foreground-muted text-center cursor-not-allowed">
                   Skill selector component (V1 simplification: Skills apply generic filters on discovery)
                 </div>
               </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle">
                <Button type="button" variant="outline" className="bg-surface hover:bg-surface-raised border-border" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" className="bg-accent hover:bg-accent-hover text-background px-8 font-medium">Post listing</Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
