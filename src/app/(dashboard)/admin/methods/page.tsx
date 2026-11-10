import { Panel } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth.server";
import { listMethods } from "@/lib/methods.server";
import { MethodForm } from "./MethodForm";

export const metadata = { title: "Manage Methods" };

export default async function AdminMethodsPage() {
  await requireUser("admin", "/admin/methods");
  const methods = await listMethods();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Methods</h1>
          <p className="mt-1 text-sm text-ink-muted">Add or edit the playbooks shown on the public Methods page.</p>
        </div>
        <Button href="/methods#playbooks" variant="secondary" size="sm">View public page</Button>
      </div>
      <div id="add-method" className="scroll-mt-20">
        <Panel title="Add method">
          <MethodForm />
        </Panel>
      </div>
      <Panel title="Published methods">
        <div className="divide-y divide-line">
          {methods.map((method) => (
            <details key={method.slug} className="py-3 first:pt-0 last:pb-0">
              <summary className="cursor-pointer break-words text-sm font-semibold">
                {method.title} <span className="ml-1 font-normal text-ink-muted">· {method.category}</span>
              </summary>
              <div className="pt-4">
                <MethodForm method={method} />
              </div>
            </details>
          ))}
        </div>
      </Panel>
    </div>
  );
}
