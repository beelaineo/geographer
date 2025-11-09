"use client";
 
export function SignUpForm() {
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    await fetch("/form.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(Array.from(formData.entries()) as [string, string][]).toString(),
    });
    // Success and error handling ...
  };
 
  return (
    <form name="newsletter-signup" onSubmit={handleFormSubmit} className="hidden md:flex items-end gap-2">
      <input type="hidden" name="form-name" value="newsletter-signup" />
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input id="email" name="email" type="email" required placeholder="Email" className="border-0 border-b border-black focus:outline-none focus:border-black bg-transparent px-0 py-1" />
      <button type="submit" className="appearance-none bg-transparent border-0 p-0 m-0 cursor-pointer text-black hover:underline uppercase">Submit</button>
    </form>
  );
}
