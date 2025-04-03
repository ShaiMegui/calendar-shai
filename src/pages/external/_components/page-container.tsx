import React from "react";
import { Loader } from "@/components/loader";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PageContainer = (props: {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  const { children, className, isLoading } = props;
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader 
            size="lg" 
            color="black" 
            className="text-primary opacity-70" 
          />
        </div>
      ) : (
        <Card
          className={cn(
            `w-full rounded-2xl shadow-xl border-none overflow-hidden 
            transition-all duration-300 hover:shadow-2xl`,
            className
          )}
        >
          <CardContent className="p-0">
            <div className="bg-white">
              {children}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PageContainer;