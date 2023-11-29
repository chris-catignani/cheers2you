import { Box } from "@chakra-ui/react";
import { kv } from '@vercel/kv';
import { Shared } from "./Shared";
import { getSocialMediaImageUrl, getSocialMediaShareUrl } from "@/lib/utils/utils";

export const getSocialMediaInfo = async (fileId) => {
  const imageUrl = getSocialMediaImageUrl(fileId)
  const { personsName, eventName, imageHeight, imageWidth } = await kv.get(fileId);
  
  // TODO handle imageUrl being expired

  return {
    personsName,
    eventName,
    imageUrl,
    imageHeight,
    imageWidth,
  }
}

export const getOpenGraphImageUrl = (imageUrl, imageHeight, imageWidth) => {
  const ratio = imageHeight / imageWidth
  const newHeight = 1200 * ratio
  const heightExtend = Math.floor(630 - newHeight)

  return (heightExtend > 0 ? 
      `${imageUrl.replace('/raw/', '/image/')}?w=1200&fit=width&extend-y=${heightExtend}&extend-color=%23FFFFFF` :
      `${imageUrl.replace('/raw/', '/image/')}?w=1200&fit=width`
  )
}

// https://nextjs.org/docs/app/api-reference/functions/generate-metadata
export const generateMetadata = async ({ params: {fileId}, searchParams }) => {
  const { personsName, eventName, imageUrl, imageHeight, imageWidth } = await getSocialMediaInfo(fileId)

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
      images: [{
        url: getOpenGraphImageUrl(imageUrl, imageHeight, imageWidth),
        width: 1200,
        height: 630,
      }],
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
