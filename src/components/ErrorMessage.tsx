import { component$ } from "@builder.io/qwik";


interface ErrorMessageProps {
  message: string;
}

export default component$(({ message }: ErrorMessageProps) => {
  return (
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">{message}</span>
    </div>
  );
});
