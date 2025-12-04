import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function Home() {
  // Redirection côté serveur vers la page de surveillance
  redirect("/surveillance")
}
