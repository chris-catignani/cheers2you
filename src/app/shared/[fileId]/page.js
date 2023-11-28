import { Box } from "@chakra-ui/react";
import { kv } from '@vercel/kv';
import { Shared } from "./Shared";
import { getSocialMediaImageUrl, getSocialMediaShareUrl } from "@/lib/utils/utils";

export const getSocialMediaInfo = async (fileId) => {
  const imageUrl = getSocialMediaImageUrl(fileId)
  const { personsName, eventName } = await kv.get(fileId);
  
  // TODO handle imageUrl being expired

  return {
    personsName,
    eventName,
    imageUrl,
  }
}

// https://nextjs.org/docs/app/api-reference/functions/generate-metadata
export const generateMetadata = async ({ params: {fileId}, searchParams }) => {
  const { personsName, eventName, imageUrl } = await getSocialMediaInfo(fileId)

  const title = `Cheers2You ${personsName}`
  const description = eventName ? 
    `Celebrate ${personsName} at ${eventName} with Cheers2You` :
    `Celebrate with ${personsName} and Cheers2You`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      siteName: 'Cheers2You',
      type: 'website',
      url: getSocialMediaShareUrl(fileId),
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
      images: [imageUrl],
    }
  }
}

export default async function Page({params: {fileId}}) {
  const socialMediaInfo = await getSocialMediaInfo(fileId)

  return (
    <main>
      <Box m='5'>
        <Shared socialMediaInfo={socialMediaInfo}/>
      </Box>
    </main>
  )
}
