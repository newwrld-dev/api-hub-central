import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { categories } from "@/data/endpoints";
import { EndpointTester } from "@/components/EndpointTester";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/endpoints/$category")({
  loader: ({ params }) => {
    const cat = categories.find((c) => c.id === params.category);
    if (!cat) throw notFound();
    return { category: cat };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.title} — Popkid API` },
          { name: "description", content: loaderData.category.tagline },
        ]
      : [],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="text-muted-foreground mb-4">Category not found.</p>
      <Link to="/endpoints" className="text-primary underline">Back to all endpoints</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-destructive">{error.message}</div>
  ),
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  return (
    <div className="space-y-6">
      <div>
        <Link to="/endpoints" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="h-3 w-3" /> All categories
        </Link>
        <h2 className="text-3xl font-bold gradient-text mb-2">{category.title}</h2>
        <p className="text-muted-foreground max-w-2xl">{category.tagline}</p>
      </div>

      <div className="space-y-5">
        {category.endpoints.map((ep) => (
          <EndpointTester key={ep.path} endpoint={ep} />
        ))}
      </div>
    </div>
  );
}
