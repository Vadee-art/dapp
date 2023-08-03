import { useParams } from "react-router-dom"
import { useGetArtwork } from "../api/getArtwork";
import { Alert } from "@/components/Elements/Alert";
import { API_URL_NO_POSTFIX } from "@/config";
import { Button } from "@/components/Elements";

export const Artwork = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetArtwork({ id: +id! })

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8 mt-16">
        <div className="flex-[3]">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex flex-col md:self-end">
              <span>Save</span>
              <span>View in Room</span>
              <span>Share</span>
            </div>
            <div className="flex-[4]">
              <img src={API_URL_NO_POSTFIX + data!.image} alt={data!.title} />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 mt-12">
            <div className="flex-1 flex flex-col md:self-start">
              {/* TOOD: real artist data */}
              <span>Shadi Ghadirian</span> 
              <Button variant="stone" className="w-full mt-2">Follow</Button>
            </div>
            <div className="flex-[4]">
              <h3 className="text-sm text-stone-500 mb-4">
                About the <strong>{data!.title}</strong> artwork from <strong>{data?.category.name}</strong>
              </h3>
              <p> {data!.aboutWork} </p>
            </div>

          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-row gap-4">
            <div className="bg-gray-300 h-24 w-24"></div>

            {/* TODO: replce with real artist data */}
            <div className="flex-1"> 
              <h3>Sahdi Ghadirian</h3>
              <span>Iran, 1974</span>
              <Button size="sm" variant="stone" className="w-full mt-2">Follow</Button>
            </div>
          </div>
          <hr className="my-4 w-full border-gray-400"/>
          <div>
            <h1 className="font-semibold text-xl"> {data!.title} </h1>
            <div className="flex flex-col text-gray-500">
              <span> {data!.year} </span>
              <span> 
                {/* TODO: put dynamic unit based on data provided from backend */}
                {data!.width} x {data!.height} cm
              </span>
              <span>
                Limited edition {data!.editionNumber} of {data!.editionTotal}
              </span>
            </div>
          </div>
          <hr className="my-4 w-full"/>
          <span className="font-semibold text-lg">${data!.price}</span>
          <Button className="w-full mt-4">Buy</Button>
        </div>
      </div>
    </div>
  )
}