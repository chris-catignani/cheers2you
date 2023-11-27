import { Box } from "@chakra-ui/react";
import { BeerBanner } from "./beerBanner/BeerBanner";

export default function Home() {
  return (
    <main>
      <Box m='5'>
        <BeerBanner />
      </Box>
    </main>
  )
}
