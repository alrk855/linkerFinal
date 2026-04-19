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
  description: z.string().min(50, "Please provide a detailed description (min 50 chars)"),
  listing_type: z.enum(["internship", "part_time", "full_time"]),
  focus_area: z.string().min(1, "Select a focus area"),
  experience_level: z.enum(["no_experience", "junior", "mid", "senior"]),
  total_slots: z.coerce.number().min(1, "Must have at least 1 slot").max(20, "Maximum 20 slots"),
});

export default function NewListingPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      listing_type: "internship",
      focus_area: "",
      experience_level: "junior",
      total_slots: 1,
    },
  });

  const onSubmit = async (values: z.infer<typeof listingSchema>) => {
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, skill_ids: [] }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || "Failed to publish listing");
      }
      toast.success("Listing published successfully.");
      router.push("/company/listings");
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish listing.");
    }
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
      <Card className="bg-surface border-border shadow-card rounded-xl">
        <CardHeader className="border-b border-border pb-6">
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">Post a New Listing</CardTitle>
          <CardDescription className="text-foreground-muted">
            Create a detailed listing to discover matched candidates.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-background border-border" placeholder="e.g. Frontend Engineering Intern" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-background border-border h-48 resize-none"
                        placeholder="Describe responsibilities, requirements, what you are looking for..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="listing_type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Role Type</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-3">
                          {[
                            { value: "internship", label: "Internship" },
                            { value: "part_time", label: "Part-time" },
                            { value: "full_time", label: "Full-time" },
                          ].map((t) => (
                            <FormItem
                              key={t.value}
                              className="flex items-center space-x-2 space-y-0 bg-background border border-border px-4 py-3 rounded-md"
                            >
                              <FormControl><RadioGroupItem value={t.value} /></FormControl>
                              <FormLabel className="font-normal cursor-pointer w-full">{t.label}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Experience Level</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-3">
                          {[
                            { value: "no_experience", label: "No experience" },
                            { value: "junior", label: "Junior" },
                            { value: "mid", label: "Mid-level" },
                            { value: "senior", label: "Senior" },
                          ].map((t) => (
                            <FormItem
                              key={t.value}
                              className="flex items-center space-x-2 space-y-0 bg-background border border-border px-4 py-3 rounded-md"
                            >
                              <FormControl><RadioGroupItem value={t.value} /></FormControl>
                              <FormLabel className="font-normal cursor-pointer w-full">{t.label}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="focus_area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Focus Area</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          <option value="" disabled>Select area</option>
                          {[
                            { value: "frontend", label: "Frontend" },
                            { value: "backend", label: "Backend" },
                            { value: "fullstack", label: "Fullstack" },
                            { value: "mobile", label: "Mobile" },
                            { value: "devops", label: "DevOps" },
                            { value: "data", label: "Data" },
                            { value: "other", label: "Other" },
                          ].map((a) => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total_slots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Positions Available</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="20" {...field} className="bg-background border-border w-24" />
                      </FormControl>
                      <p className="text-xs text-foreground-muted mt-1">
                        Max candidates you can acknowledge for this role.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-surface hover:bg-surface-raised border-border"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-accent hover:bg-accent-hover text-white px-8 font-medium"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Publishing..." : "Post Listing"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
