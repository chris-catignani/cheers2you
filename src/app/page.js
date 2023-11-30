'use client'

import { Box } from "@chakra-ui/react";
import { Home } from "./home/Home";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { selectDefaultVenueName, setVenue } from "@/lib/redux";
import { useEffect } from "react";

export default function Page() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams()

  const defaultVenueName = useSelector(selectDefaultVenueName)
  
  const venueName = searchParams.get('venue') || defaultVenueName
  useEffect(() => {
    dispatch(setVenue(venueName))
  }, [dispatch, venueName])

  return (
    <Box m='5'>
      <Home venueName={venueName} />
    </Box>
  )
}
