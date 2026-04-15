import {
  Button,
  FlexBox,
  Text,
  type AnalyticalTableColumnDefinition,
} from "@ui5/webcomponents-react";

export const getColumns = ({
  onEditClick,
}: {
  onEditClick: (index: number, currentValue: string) => void;
}) => {
  const columns: AnalyticalTableColumnDefinition[] = [
    {
      accessor: "Payee",
      Header: "Payee",
      minWidth: 200,
      width: 200,
      autoResizable: true,
    },
    {
      Header: "Amount",
      accessor: "Amount",
      width: 150,
      autoResizable: true,
    },
    {
      Header: "Payment Type",
      accessor: "Payment_Type",
      minWidth: 180,
      autoResizable: true,
      Cell: (instance) => <Text>{instance.value}</Text>,
    },
    {
      id: "actions",
      Header: "Actions",
      width: 100,
      disableResizing: true,
      sticky: "right",
      Cell: (instance) => {
        return (
          <FlexBox>
            <Button
              icon="edit"
              design="Transparent"
              onClick={() =>
                onEditClick(instance.row.index, instance.row.original.Payment_Type ?? "")
              }
            />
          </FlexBox>
        );
      },
    },
  ];

  return columns;
};

export const errorColumns: AnalyticalTableColumnDefinition[] = [
  {
    Header: "Document Entry",
    accessor: "DocEntry",
    width: 200,
  },
  {
    Header: "Error",
    accessor: "Error",
    width: 200,
  },
  {
    Header: "Reason",
    accessor: "Reason",
    autoResizable: true,
  },
];
