import { Alert } from "@/components/Elements/Alert";
import { ArtistsFilters, useGetArtists } from "../api/getArtists";
import { Artist, ArtistSkeleton } from "../components/Artist";
import { Pagination } from "@/components/Elements/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { useGetArtistFilters } from "../api/getArtistFilters";
import { ArtistsFilterForm } from "../components/ArtistsFilterForm";
import { useState } from "react";

export const Artists = () => {
  const {page, setPage} = usePagination();
  const [artistsFilters, setArtistsFilters] = useState<ArtistsFilters>({
    origin: [],
  });
  const { data, isLoading, error } = useGetArtists({page, ...artistsFilters});
  const {
    data: filters,
    isLoading: filtersLoading,
    error: filtersError,
  } = useGetArtistFilters();

  if (error || filtersError) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8 mt-16">
        <h1 className="flex-1 font-bold">Artists</h1>
        <p className="flex-[4]">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates incidunt soluta officia distinctio eius, veritatis molestiae, unde deserunt magnam minima ea nisi reprehenderit dicta possimus asperiores quia, a quo eum?
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nesciunt repellat reprehenderit veritatis, neque error in quia sapiente, corporis atque quo illum recusandae porro et a! Laudantium vel deleniti ut adipisci?
        </p>
      </div>
      <div className="flex flex-row gap-8 mt-16">
        {filtersLoading ? (
          <div className="bg-gray-200 animate-pulse flex-1 hidden md:block"></div>
        ) : (
          <ArtistsFilterForm filters={filters!} onChange={
            (filters) => {
              setArtistsFilters(filters);
            }
          }/>
        )}
        <div className="flex-[4]">
          <div className="grid gap-x-4 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {isLoading ? 
              Array.from({ length: 9 }, (_, i) => <ArtistSkeleton key={i} />) : 
              data!.results.map((artist) => (
                <Artist key={artist.Id} artist={artist} />
              ))
            }
          </div>
          <Pagination           
            currentPage={page}
            totalPages={isLoading ? 1 : Math.ceil(data!.count/9)}
            onChange={(p) => {
              setPage(p);
            }}/>
        </div>
      </div>
    </div>
  );
}