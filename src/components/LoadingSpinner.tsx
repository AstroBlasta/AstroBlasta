import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
});
