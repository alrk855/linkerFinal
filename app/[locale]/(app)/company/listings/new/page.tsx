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
  title: z.string().min(5, "Насловот е премногу краток").max(100, "Насловот е премногу долг"),
  description: z.string().min(50, "Внесете подетален опис (минимум 50 карактери)"),
  listing_type: z.enum(["internship", "part_time", "full_time"]),
  focus_area: z.string().min(1, "Изберете област"),
  experience_level: z.enum(["no_experience", "junior", "mid", "senior"]),
  total_slots: z.coerce.number().min(1, "Мора да има најмалку 1 слот").max(20, "Максимум 20 слотови"),
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
        throw new Error(body?.error?.message || "Неуспешно објавување оглас");
      }
      toast.success("Огласот е успешно објавен.");
      router.push("/company/listings");
    } catch (err: any) {
      toast.error(err?.message || "Неуспешно објавување оглас.");
    }
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
      <Card className="bg-surface border-border shadow-card rounded-xl">
        <CardHeader className="border-b border-border pb-6">
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">Објави нов оглас</CardTitle>
          <CardDescription className="text-foreground-muted">
            Креирајте детален оглас за да пронајдете соодветни кандидати.
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
                    <FormLabel>Наслов на позиција</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-background border-border" placeholder="пр. Практикант за фронтенд развој" />
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
                    <FormLabel>Опис</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-background border-border h-48 resize-none"
                        placeholder="Опишете одговорности, барања и што барате..."
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
                      <FormLabel>Тип на позиција</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-3">
                          {[
                            { value: "internship", label: "Практикантство" },
                            { value: "part_time", label: "Скратено работно време" },
                            { value: "full_time", label: "Полно работно време" },
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
                      <FormLabel>Ниво на искуство</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-3">
                          {[
                            { value: "no_experience", label: "Без искуство" },
                            { value: "junior", label: "Јуниор" },
                            { value: "mid", label: "Средно ниво" },
                            { value: "senior", label: "Сениор" },
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
                      <FormLabel>Област</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          <option value="" disabled>Избери област</option>
                          {[
                            { value: "frontend", label: "Фронтенд" },
                            { value: "backend", label: "Бекенд" },
                            { value: "fullstack", label: "Фулстек" },
                            { value: "mobile", label: "Мобилен развој" },
                            { value: "devops", label: "DevOps" },
                            { value: "data", label: "Податоци" },
                            { value: "other", label: "Друго" },
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
                      <FormLabel>Достапни позиции</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="20" {...field} className="bg-background border-border w-24" />
                      </FormControl>
                      <p className="text-xs text-foreground-muted mt-1">
                        Максимален број кандидати што можете да ги потврдите за оваа улога.
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
                  Откажи
                </Button>
                <Button
                  type="submit"
                  className="bg-accent hover:bg-accent-hover text-white px-8 font-medium"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Се објавува..." : "Објави оглас"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
