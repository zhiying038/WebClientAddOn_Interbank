import { BusyIndicator, FlexBox } from "@ui5/webcomponents-react";

export const Loader: React.FC = () => {
  return (
    <FlexBox justifyContent="Center" alignItems="Center" style={{ height: "100vh" }}>
      <BusyIndicator active />
    </FlexBox>
  );
};
