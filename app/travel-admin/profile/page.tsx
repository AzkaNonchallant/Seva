import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Header, PageHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/app/actions/auth-actions";
import { me } from "@/lib/api/auth";
import { requireBookingManager } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";

export const metadata = { title: "Profil • Dinas Travel" };

export default async function ProfilePage() {
  // The layout already gated the session; `me` re-reads it from the API so
  // the screen reflects the server's view of the account.
  const user = await requireBookingManager();
  const fresh = await me().catch(() => user);

  const scope = [
    "Melihat seluruh travel request",
    "Mengelola antrean penugasan booking",
    "Membuat, mengonfirmasi, dan membatalkan booking",
    "Memantau keberangkatan karyawan",
    "Membaca travel policy dan laporan",
  ];

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Profil" },
        ]}
        unreadCount={0}
      />

      <main className="flex max-w-3xl flex-col gap-md px-margin-mobile py-md md:px-md">
        <PageHeader
          title="Profil Saya"
          description="Data akun yang dibaca dari GET /api/auth/me."
        />

        <Card>
          <div className="flex items-start gap-4 border-b border-outline-variant/15 p-md">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-container text-headline-md font-bold text-on-primary-container">
              {initialsOf(fresh.name)}
            </span>
            <div className="min-w-0">
              <h2 className="text-headline-md font-semibold text-on-surface">
                {fresh.name}
              </h2>
              <p className="text-body-md text-on-surface-variant">
                {fresh.email}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="primary" icon="badge">
                  {ROLE_LABEL[fresh.role]}
                </Badge>
                <Badge tone="neutral">Role API: {fresh.role}</Badge>
              </div>
            </div>
          </div>

          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Fact label="Jabatan" value={fresh.positionName ?? "—"} />
            <Fact label="Departemen" value={fresh.departmentName ?? "—"} />
            <Fact label="Status akun" value={fresh.isActive ? "Aktif" : "Nonaktif"} />
            <Fact label="ID pengguna" value={String(fresh.id)} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Cakupan Akses"
            description="Hak yang diberikan oleh role ini di API_SPEC."
          />
          <CardBody>
            <ul className="space-y-2">
              {scope.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span
                    className="material-symbols-outlined mt-px shrink-0 text-success"
                    style={{ fontSize: 16 }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-md text-on-surface-variant">{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-label-md font-semibold text-on-surface">
                Keluar dari akun
              </p>
              <p className="text-caption text-on-surface-variant">
                Sesi tersimpan di cookie httpOnly dan berakhir otomatis setelah 8
                jam.
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-error-container px-md text-label-md font-semibold text-on-error-container transition-opacity hover:opacity-90"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  logout
                </span>
                Keluar
              </button>
            </form>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption text-tertiary">{label}</p>
      <p className="mt-0.5 text-label-md font-semibold text-on-surface">{value}</p>
    </div>
  );
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
