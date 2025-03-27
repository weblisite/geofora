import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const answerSchema = z.object({
  content: z.string().min(20, "Answer must be at least 20 characters long"),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

interface AnswerFormProps {
  questionId: number;
}

export default function AnswerForm({ questionId }: AnswerFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      content: "",
    },
  });

  const createAnswerMutation = useMutation({
    mutationFn: async (data: AnswerFormValues) => {
      return apiRequest("POST", `/api/questions/${questionId}/answers`, {
        ...data,
        questionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${questionId}/answers`] });
      form.reset();
      toast({
        title: "Answer submitted",
        description: "Your answer has been posted successfully",
      });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit answer: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: AnswerFormValues) => {
    setIsSubmitting(true);
    createAnswerMutation.mutate(data);
  };

  return (
    <div className="p-6">
      <h4 className="text-lg font-medium mb-4">Your Answer</h4>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Glassmorphism className="p-4 rounded-lg border border-dark-400">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Share your expertise..."
                      className="w-full bg-transparent border-0 text-gray-300 text-sm p-2 focus:outline-none focus:ring-0 min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between pt-4 border-t border-dark-400">
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-dark-300">
                  <span className="material-icons text-sm">format_bold</span>
                </button>
                <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-dark-300">
                  <span className="material-icons text-sm">format_italic</span>
                </button>
                <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-dark-300">
                  <span className="material-icons text-sm">format_list_bulleted</span>
                </button>
                <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-dark-300">
                  <span className="material-icons text-sm">link</span>
                </button>
                <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-dark-300">
                  <span className="material-icons text-sm">image</span>
                </button>
              </div>

              <Button 
                type="submit" 
                className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Posting...
                  </>
                ) : (
                  "Post Answer"
                )}
              </Button>
            </div>
          </Glassmorphism>
        </form>
      </Form>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          By posting, you agree to our <a href="#" className="text-primary-400 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-400 hover:underline">Community Guidelines</a>.
        </p>
      </div>
    </div>
  );
}
