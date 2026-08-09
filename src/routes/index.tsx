import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="p-8">
      <Link to="/auth" className="text-primary underline cursor-pointer">Link a Auth</Link>
    </div>
  )
}
