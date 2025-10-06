import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import BasicLayout from "../components/BasicLayout";

type BirdInfo = {
  _id: string;
  com_name: string;
  date: string;
  time: string;
  confidence: number;
};

type BirdInfoWithImage = BirdInfo & { imgSrc: string };

// TODO: Sync and upload histogram!

function FunStuff() {
  const imgWidth = 200;
  const [birds, setBirds] = useState<BirdInfoWithImage[]>([]);

  useEffect(() => {
    const fetchBirdsWithImages = async () => {
      const response = await fetch("/.netlify/functions/birds");
      const body = await response.json();
      if (response.status !== 200) {
        throw new Error(body.error.message);
      }

      for (let bird of body) {
        const imgSrc = await fetchBirdImage(bird.com_name, imgWidth);
        bird.imgSrc = imgSrc;
      }

      setBirds(body);

      return body;
    };

    fetchBirdsWithImages();
  }, []);

  return (
    <BasicLayout>
      <p>
        I set up a raspberrypi with a mic with BirdNET-Pi installed and it
        records and identifies bird calls. Twice a day, the data is synced onto
        the cloud for querying here.
      </p>
      <p>Most recent birds identified:</p>
      <div>
        {birds.map((bird) => (
          <BirdCard bird={bird} key={bird._id} imgWidth={imgWidth} />
        ))}
      </div>
    </BasicLayout>
  );
}

async function fetchBirdImage(comName: string, width: number) {
  const VALID_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  function isValidImageTitle(title: string) {
    const lower = title.toLowerCase();
    return VALID_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
  }
  const query = encodeURIComponent(comName);
  // srnamespace=6 -> only return results that are files
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${query}&srnamespace=6&srlimit=5&origin=*`;
  const fileNameResponse = await fetch(url, { cache: "force-cache" });
  const fileNameBody = await fileNameResponse.json();
  if (fileNameResponse.status !== 200) {
    throw new Error(fileNameBody.error.message);
  }

  const fileNameResults = fileNameBody.query?.search || [];
  const file = fileNameResults.find((r: any) => isValidImageTitle(r.title));
  if (!file) {
    console.warn(`No valid image found for ${comName}`);
    return null;
  }

  const fileUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(
    file.title
  )}&prop=imageinfo&iiprop=url&iiurlwidth=${width}&origin=*`;

  const imageResponse = await fetch(fileUrl, { cache: "force-cache" });
  const imageBody = await imageResponse.json();
  if (imageResponse.status !== 200) {
    throw new Error(imageBody.error.message);
  }

  const page = Object.values(imageBody.query?.pages)[0] as any;
  const imageUrl =
    !!page.imageinfo?.[0]?.thumburl &&
    !page.imageinfo?.[0].thumburl.includes("assets")
      ? page.imageinfo?.[0].thumburl
      : page.imageinfo?.[0]?.url;

  return imageUrl;
}

const BirdCardDisplay = styled.div`
  padding: 1em;
  border: 1.5px solid var(--color-border);
  background-color: var(--color-content-background);
  border-radius: 10px;
  margin: 1em;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1em;
  > p,
  h3 {
    margin: 0.25em;
  }
`;

const BirdCardInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5em;
  > p,
  h3 {
    margin: 0em;
  }
`;

function BirdCard({
  bird,
  imgWidth,
}: {
  bird: BirdInfoWithImage;
  imgWidth: number;
}) {
  const date = new Date(bird.date + " " + bird.time); // this is in Pacific Time
  return (
    <BirdCardDisplay>
      <img
        src={bird.imgSrc}
        alt={`A ${bird.com_name}`}
        width={imgWidth}
        height={140}
        object-fit={"cover"}
      ></img>
      <BirdCardInfo>
        <p>{date.toDateString() + " " + date.toLocaleTimeString()}</p>
        <h2>{bird.com_name}</h2>
        <p>
          Confidence: <b>{Math.round(bird.confidence * 100)}%</b>
        </p>
      </BirdCardInfo>
    </BirdCardDisplay>
  );
}

export default FunStuff;
