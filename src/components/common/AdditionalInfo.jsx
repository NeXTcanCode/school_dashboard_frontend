import React from "react";
import Card from "./Card";
import ContentInsights from "./ContentInsights";

const AdditionalInfo = () => {
  return (
    <div className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Content Insights</h4>
        {/* <span className="text-muted small">Interactive analytics for sales demo</span> */}
      </div>

      <Card className="p-3">
        <ContentInsights />
      </Card>
    </div>
  );
};

export default AdditionalInfo;
