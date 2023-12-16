'use client'

import { useRouter } from 'next/navigation';
import { Box } from "@chakra-ui/react";
import { Beers } from "./Beers";
import { useSearchParams } from "next/navigation";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPersonsName, selectVenueName, setPersonsName, setVenueName } from '@/lib/redux';

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

  const storedPersonsName = useSelector(selectPersonsName)
  useEffect(() => {
    if (personsName !== storedPersonsName) {
      dispatch(setPersonsName(personsName))
    }
  }, [dispatch, personsName, storedPersonsName])

  if (!personsName || !venueName || personsName !== storedPersonsName) {
    router.push('/?' + searchParams)
    return (<></>)
  }

  return (
    <Box m='3'>
      <Beers venueName={venueName}/>
    </Box>
  )
}
