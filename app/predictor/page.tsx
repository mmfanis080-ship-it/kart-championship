import { notFound } from 'next/navigation'

// Retired feature: return 404 even when this route existed in a previous deployment.
export default function PredictorRemovedPage() {
  notFound()
}
