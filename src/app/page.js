'use client'

import { Box } from "@chakra-ui/react";
import { Home } from "./home/Home";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getVenues, selectVenues, setVenueName } from "@/lib/redux";
import { useEffect } from "react";

export default function Page() {
  const dispatch = useDispatch();
  const router = useRouter();

  const venues = useSelector(selectVenues)
  const searchParams = useSearchParams()
  const venueName = searchParams.get('venue')

  useEffect(() => {
    if(venueName) {
      dispatch(setVenueName(venueName))
    }
  }, [dispatch, venueName])

  useEffect(() => {
    if (venues.length === 0) {
      dispatch(getVenues())
    }
  }, [dispatch, venues])

  if (!venueName && venues?.[0]) {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('venue', venues?.[0]?.venueUrl)
    router.replace('/?' + newSearchParams)
  }

  return (
    <Box m='3'>
      <Home venueName={venueName} />
    </Box>
  )
}
