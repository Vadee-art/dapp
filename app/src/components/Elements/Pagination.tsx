import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/solid';
import ReactPaginate from 'react-paginate';
import { useSearchParams } from 'react-router-dom';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onChange?: (page: number) => void;
};

export const Pagination = (props: PaginationProps) => {
  const { currentPage, totalPages, onChange } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex w-full justify-center">
      <ReactPaginate
        className="flex w-full flex-wrap gap-4 text-gray-500"
        pageCount={totalPages}
        pageRangeDisplayed={3}
        marginPagesDisplayed={1}
        forcePage={currentPage - 1}
        onPageChange={(page) => {
          searchParams.set('page', (page.selected + 1).toString());
          setSearchParams(searchParams);
          if (!onChange) return;
          onChange(page.selected + 1);
        }}
        pageLabelBuilder={(page) => page}
        containerClassName="flex flex-wrap gap-4 w-full text-gray-500"
        pageLinkClassName="hover:text-teal-500"
        activeLinkClassName="text-teal-500"
        breakLabel={<EllipsisHorizontalIcon className="h-6 w-6" />}
        breakLinkClassName=""
        nextAriaLabel="next page"
        previousAriaLabel="previous page"
        nextLabel={
          <div className="flex items-center gap-1 hover:text-teal-500">
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </div>
        }
        previousLabel={
          <div className="flex items-center gap-1 hover:text-teal-500">
            <ChevronLeftIcon className="h-4 w-4" />
            Prev
          </div>
        }
        nextLinkClassName=""
        previousLinkClassName=""
      />
    </div>
  );
};
