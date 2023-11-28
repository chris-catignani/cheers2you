import { Box } from "@chakra-ui/react";
import { Shared } from "./Shared";

export const getSocialMediaInfo = async (fileId) => {
  // const socialMediaInfo = await fetch(`https://upcdn.io/W142hJk/raw/demo/${fileId}.json`).then((res) => res.json())
  return {
    imageUrl: `https://upcdn.io/W142hJk/raw/demo/${fileId}.jpeg`
  }
}

export const generateMetadata = async ({ params: {fileId}, searchParams }) => {
  const socialMediaInfo = await getSocialMediaInfo(fileId)

  const title = `Cheers2You ${socialMediaInfo.personsName}`
  const description = `Celebrate ${socialMediaInfo.personsName} at ${socialMediaInfo.eventName} with Cheers2You`

  return {
    title,
    description,
    twitter: {
      title,
      description,
      card: 'summary_large_image',
      images: [socialMediaInfo.imageUrl],
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
