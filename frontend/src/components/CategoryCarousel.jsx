import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Button } from "./ui/button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";

const category = [
  "Frontend Developer",
  "Backend Developer",
  "Data Science",
  "Graphic Designer",
  "FullStack Developer",
];

const CategoryCarousel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  return (
    <section className="px-4 py-12 sm:py-14 md:py-16 lg:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="mb-2 text-center">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Browse by role
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Jump into a category—results open on the browse page.
          </p>
        </div>
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {category.map((cat) => (
              <CarouselItem
                key={cat}
                className="basis-full pl-2 sm:basis-1/2 md:pl-4 lg:basis-1/3"
              >
                <Button
                  onClick={() => searchJobHandler(cat)}
                  variant="outline"
                  className="h-auto min-h-11 w-full whitespace-normal rounded-full border-border bg-card px-4 py-2.5 text-center text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/8 hover:text-primary sm:text-base"
                >
                  {cat}
                </Button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden border-border sm:flex" />
          <CarouselNext className="hidden border-border sm:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default CategoryCarousel;
