import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

type FormValues = z.infer<typeof schema>;

const ContactPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert([{
      name: values.name,
      email: values.email,
      subject: values.subject,
      message: values.message,
    }]);
    setSubmitting(false);
    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      toast.success("Message sent! We'll be in touch soon.");
      form.reset();
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container">
          <h1 className="mb-8 font-display text-4xl font-bold">Contact Us</h1>
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Info */}
            <div>
              <p className="mb-6 font-body text-muted-foreground">
                We'd love to hear from you. Whether you're looking for a church home,
                have questions, or want to get involved, reach out to us.
              </p>
              <div className="space-y-4 font-body text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-accent" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-muted-foreground">600 W Campbell Ave, Campbell, CA 95008</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 text-accent" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-muted-foreground">(408) 378-7422</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 text-accent" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-muted-foreground">info@campbellsda.org</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 text-accent" />
                  <div>
                    <p className="font-semibold">Service Times</p>
                    <p className="text-muted-foreground">Sabbath School: 9:30 AM</p>
                    <p className="text-muted-foreground">Divine Worship: 11:00 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Name</FormLabel>
                      <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Email</FormLabel>
                      <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Subject</FormLabel>
                      <FormControl><Input placeholder="Subject" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Message</FormLabel>
                      <FormControl><Textarea rows={5} placeholder="Your message..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={submitting} className="w-full font-body">
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
