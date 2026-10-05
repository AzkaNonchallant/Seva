import Link from "next/link";

import { Header, PageHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getUnreadCount } from "@/lib/api/notification";
import { listUsers } from "@/lib/api/user";
import { requireSuperAdmin } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";

import type { Role } from "@/lib/api/types";

export const metadata = { title: "Role & Izin • Super Admin" };

/** §8, restated row by row so the screen documents what the API enforces. */
const SCOPE: Record<Role, string[]> = {
  EMPLOYEE: [
    "Membuat pengajuan travel dan rework draft miliknya sendiri",
    "Mengunggah dokumen pendukung pada pengajuannya",
    "MengAjukan dan membatalkan pengajuannya",
    "Membuat serta mengajukan reimbursement atas travel yang selesai",
  ],
  MANAGER: [
    "Memutuskan approval di level Manager",
    "Membuat dan mencabut delegasi wewenang",
    "Membaca seluruh pengajuan untuk keperluan approval",
  ],
  DEPARTMENT_HEAD: [
    "Memutuskan approval di level Department Head",
    "Membuat dan mencabut delegasi wewenang",
    "Membaca seluruh pengajuan untuk keperluan approval",
  ],
  HRD: [
    "Memutuskan approval di level HRD",
    "Membuat dan mencabut delegasi wewenang",
    "Membaca seluruh pengajuan untuk keperluan approval",
  ],
  FINANCE: [
    "Memverifikasi dan membayar reimbursement",
    "Membaca laporan pengeluaran per departemen, karyawan, dan project",
  ],
  ADMIN: [
    "Membaca seluruh travel request",
    "Membaca laporan keuangan dan memverifikasi reimbursement",
  ],
  SUPER_ADMIN: [
    "Mengelola seluruh master data: pengguna, departemen, jabatan, travel policy",
    "Menetapkan role setiap pengguna",
    "Membaca seluruh data pengajuan di seluruh perusahaan",
  ],
  TRAVEL_ADMIN: [
    "Membuat, mengonfirmasi, dan membatalkan booking",
    "Mengelola antrean penugasan booking dan keberangkatan",
    "Membaca seluruh travel request dan travel policy",
  ],
};

const ORDER: Role[] = [
  "EMPLOYEE",
  "MANAGER",
  "DEPARTMENT_HEAD",
  "HRD",
  "FINANCE",
  "ADMIN",
  "TRAVEL_ADMIN",
  "SUPER_ADMIN",
];

/**
 * Reference screen for the role matrix.
 *
 * The spec defines permissions as a table, not as an endpoint: there is no
 * "list permissions" call anywhere in API_SPEC. So this reads nothing and
 * simply documents §8 alongside the live headcount from `GET /api/users`, and
 * points role assignment at the endpoint that does exist.
 */
export default async function RolesPermissionsPage() {
  await requireSuperAdmin();

  const [unread, users] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    listUsers().catch(() => ({ data: [], pagination: { page: 1, limit: 0, total: 0, totalPages: 0 } })),
  ]);

  const counts = new Map<Role, number>();
  for (const user of users.data) {
    if (user.isActive === false) continue;
    counts.set(user.role, (counts.get(user.role) ?? 0) + 1);
  }

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Super Admin", href: "/admin/dashboard" },
          { label: "Role & Izin" },
        ]}
        unreadCount={unread.count}
        notificationsHref="/admin/notifications"
        profileHref="/admin/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Role & Izin"
          description="Ringkasan tabel akses pada API_SPEC bagian 8. API_SPEC mendefinisikan izin sebagai tabel per role, bukan sebagai endpoint, sehingga halaman ini bersifat referensi dan tidak menyimpan data terpisah."
        />

        <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
          {ORDER.map((role) => (
            <Card key={role}>
              <CardHeader
                title={ROLE_LABEL[role]}
                description={
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral" variant="outline">
                      {role}
                    </Badge>
                    <span>{counts.get(role) ?? 0} pengguna aktif</span>
                  </span>
                }
                action={
                  <Link
                    href={`/admin/users?role=${role}`}
                    className="whitespace-nowrap text-caption font-semibold text-primary transition-colors hover:text-primary-container"
                  >
                    Lihat pengguna
                  </Link>
                }
              />
              <CardBody>
                <ul className="space-y-2">
                  {SCOPE[role].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span
                        className="material-symbols-outlined mt-px shrink-0 text-success"
                        style={{ fontSize: 16 }}
                      >
                        check_circle
                      </span>
                      <span className="text-body-md text-on-surface-variant">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader
            title="Cara Mengubah Role"
            description="Satu pengguna satu kali, melalui endpoint yang sama dengan yang di screens ini."
          />
          <CardBody className="flex flex-col gap-2 text-caption text-on-surface-variant">
            <p>
              Penetapan role memakai{" "}
              <code className="font-mono text-on-surface">
                PATCH /api/users/:id/role
              </code>{" "}
              dengan body{" "}
              <code className="font-mono text-on-surface">
                {'{ "role": "MANAGER" }'}
              </code>
              . Kontrol pada kolom role di tabel pengguna memanggil endpoint yang
              sama.
            </p>
            <p>
              API_SPEC tidak menyediakan endpoint untuk membaca atau menulis
              matriks izin. Daftar di atas berasal langsung dari tabel pada
              bagian 8, sehingga menambah role baru memerlukan perubahan pada
              spec lebih dahulu.
            </p>
          </CardBody>
        </Card>
      </main>
    </>
  );
}
