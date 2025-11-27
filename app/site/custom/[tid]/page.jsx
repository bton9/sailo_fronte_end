import PlaceDetail from '@/app/site/custom/components/location/PlaceDetail'

export default async function Page({ params }) {
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id
  return <PlaceDetail placeId={id} />
}
