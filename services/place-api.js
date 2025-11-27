import { useEffect, useState } from 'react'

export default function PlacesList() {
  const [places, setPlaces] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/api/places')
      .then((res) => res.json())
      .then((data) => setPlaces(data))
      .catch((err) => console.error(err))
  }, [])
  if (!places) return <p>載入中...</p>
  return (
    <div>
      {places.map((item) => (
        <div key={item.place_id}>
          <h2>{item.name}</h2>
          <img
            src={`http://localhost:5000${item.cover_image}`}
            alt={item.name}
            width={300}
          />
        </div>
      ))}
    </div>
  )
}
