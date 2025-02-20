// src/components/CompositionCard.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CompositionCardProps {
  title: string;
  firstSectionTitle: string;
  collection_type: string;
  id: number;
}

const CompositionCard = ({
  title,
  firstSectionTitle,
  collection_type,
  id
}: CompositionCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/composition/${collection_type}/section/${id}`);
  };

  return (
    <Card
      className="bg-[#1A1F2C] text-white border-none mb-6 cursor-pointer transition-all hover:bg-[#252A37]"
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-serif">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 text-lg">
          {firstSectionTitle}
        </p>
      </CardContent>
    </Card>
  );
};

export default CompositionCard;