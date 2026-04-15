import type { BankPayment, InterbankPostingInput } from "@/api";
import { useUser } from "@/contexts";
import { useGenerateFile, usePaymentErrors, usePayments } from "@/hooks";
import {
  AnalyticalTable,
  Bar,
  Button,
  Dialog,
  IllustratedMessage,
  Modals,
  Tab,
  TabContainer,
} from "@ui5/webcomponents-react";
import type { TableInstance } from "@ui5/webcomponents-react/dist/components/AnalyticalTable/types/index.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PaymentTypeDialog } from "../PaymentTypeDialog";
import { errorColumns, getColumns } from "./settings";

type Props = {
  data: InterbankPostingInput;
  title?: string;
  visible?: boolean;
  onActionClose?: () => void;
};

export const PaymentPreview: React.FC<Props> = (props) => {
  const { data, title, visible = false, onActionClose } = props;

  // ========== HOOKS
  const tableRef = useRef<TableInstance>(null);
  const { user } = useUser();

  const { data: payments = [], isPending: isPendingPayment } = usePayments(
    data,
    user?.UserCode ?? "",
    visible
  );
  const { data: errors = [], isPending: isPendingErrors } = usePaymentErrors(
    data,
    user?.UserCode ?? "",
    visible
  );
  const { mutate: generateFile, isPending: isGenerating } = useGenerateFile();

  // ========== STATES
  const [activeTab, setActiveTab] = useState(0);
  const [editedPayments, setEditedPayments] = useState(payments);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    rowIndex: number | null;
    defaultValue: string;
  }>({ open: false, rowIndex: null, defaultValue: "" });

  // ========== EVENTS
  const onEditClick = useCallback((index: number, currentValue: string) => {
    setEditDialog({ open: true, rowIndex: index, defaultValue: currentValue });
  }, []);

  const onEditConfirm = useCallback((paymentType: string) => {
    setEditDialog((prev) => {
      if (prev.rowIndex === null) return prev;
      setEditedPayments((payments) =>
        payments.map((p, i) => (i === prev.rowIndex ? { ...p, Payment_Type: paymentType } : p))
      );
      return { open: false, rowIndex: null, defaultValue: "" };
    });
  }, []);

  const onEditClose = useCallback(() => {
    setEditDialog({ open: false, rowIndex: null, defaultValue: "" });
  }, []);

  const onActionDownload = useCallback(() => {
    const selected = (tableRef.current?.selectedFlatRows?.map((x) => x.original) ??
      []) as BankPayment[];
    if (selected.length === 0) {
      Modals.showMessageBox({
        type: "Error",
        children: "No document selected to download",
      });
      return;
    }
    generateFile({
      input: data,
      username: user?.UserCode ?? "",
      rows: selected,
    });
  }, [data, generateFile]);

  // ========== VARIABLES
  const columns = useMemo(() => getColumns({ onEditClick }), [onEditClick]);

  // ========== EFFECTS
  useEffect(() => {
    if (isPendingPayment || payments.length === 0) return;
    setEditedPayments(payments);
  }, [payments, isPendingPayment]);

  useEffect(() => {
    if (!visible || editedPayments.length === 0) return;
    const timer = setTimeout(() => {
      if (tableRef.current) {
        (tableRef.current as any).toggleAllRowsSelected(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [editedPayments, visible]);

  // ========== VIEWS
  return (
    <>
      <Dialog
        stretch
        open={visible}
        headerText={title}
        className="contentPartNoPadding footerPartNoPadding"
        footer={
          <Bar
            design="Footer"
            endContent={
              <>
                <Button
                  design="Emphasized"
                  loading={isGenerating}
                  disabled={activeTab !== 0}
                  onClick={onActionDownload}
                >
                  Download
                </Button>
                <Button onClick={onActionClose}>Close</Button>
              </>
            }
          />
        }
      >
        <TabContainer
          tabLayout="Standard"
          contentBackgroundDesign="Solid"
          headerBackgroundDesign="Solid"
          onTabSelect={(e) => setActiveTab(e.detail.tabIndex)}
        >
          <Tab text={`Payments (${editedPayments.length})`}>
            <AnalyticalTable
              data={editedPayments}
              columns={columns}
              selectionMode="Multiple"
              tableInstance={tableRef}
              loading={isPendingPayment}
              selectionBehavior="RowSelector"
              NoDataComponent={() => <IllustratedMessage design="Auto" />}
            />
          </Tab>

          <Tab text={`Errors (${errors.length})`} disabled={errors.length === 0}>
            <AnalyticalTable
              data={errors}
              columns={errorColumns}
              loading={isPendingErrors}
              NoDataComponent={() => <IllustratedMessage design="Auto" />}
            />
          </Tab>
        </TabContainer>
      </Dialog>

      <PaymentTypeDialog
        open={editDialog.open}
        defaultValue={editDialog.defaultValue}
        onConfirm={onEditConfirm}
        onClose={onEditClose}
      />
    </>
  );
};
