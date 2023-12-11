'use client'

import { useRouter } from 'next/navigation';
import { Box } from "@chakra-ui/react";
import { Beers } from "./Beers";
import { useSearchParams } from "next/navigation";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectVenueName, setVenueName } from '@/lib/redux';

export default function Page() {
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()

  const personsName = searchParams.get('name')
  const venueName = searchParams.get('venue')

  const storedVenueName = useSelector(selectVenueName)
  useEffect(() => {
    if (venueName && venueName !== storedVenueName) {
      dispatch(setVenueName(venueName))
    }
  }, [dispatch, venueName, storedVenueName])

  if (!personsName || !venueName) {
    router.push('/?' + searchParams)
    return (<></>)
  }

  return (
    <Box m='3'>
      <Beers personsName={personsName} venueName={venueName}/>
    </Box>
  )
}
