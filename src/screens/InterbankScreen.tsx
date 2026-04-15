import type { InterbankPostingInput, ProcessedFeedbackResponse } from "@/api";
import { PaymentPreview } from "@/components";
import { useBanks, useCancelJE, useCancelPayment, useImportFeedback } from "@/hooks";
import type { FileUploaderDomRef, Ui5CustomEvent } from "@ui5/webcomponents-react";
import {
  BusyIndicator,
  Button,
  CheckBox,
  DatePicker,
  FileUploader,
  FlexBox,
  Form,
  FormItem,
  Input,
  Label,
  Modals,
  Option,
  Select,
} from "@ui5/webcomponents-react";
import type { FileUploaderChangeEventDetail } from "@ui5/webcomponents/dist/FileUploader.js";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

export const InterbankScreen = () => {
  // ========== STATES
  const [showPayments, setShowPayments] = useState(false);

  // ========== HOOKS
  const fileUploaderRef = useRef<FileUploaderDomRef>(null);
  const { control, getValues, handleSubmit, watch, setValue } = useForm<InterbankPostingInput>({
    defaultValues: {
      Draft: false,
      DocNoFr: "",
      DocNoTo: "",
      Method: "I",
      Bank: "",
      PostDate: dayjs().format("YYYY-MM-DD"),
    },
  });

  const selectedBank = watch("Bank");

  const { data: banks = [] } = useBanks();
  const { mutateAsync: importFeedbackAsync, isPending: isImporting } = useImportFeedback();
  const { mutate: cancelOutgoingPayment } = useCancelPayment();
  const { mutate: cancelJournalEntry } = useCancelJE();

  // ========== VARIABLES
  const bankSettings = banks.find((b) => b.Code === selectedBank);

  // ========== EVENTS
  const onActionDownload = () => {
    setShowPayments(true);
  };

  const onImportFeedback = async (
    e: Ui5CustomEvent<FileUploaderDomRef, FileUploaderChangeEventDetail>
  ) => {
    const file = e.detail.files?.[0];
    if (!file) return;
    const output = await importFeedbackAsync({ bank: getValues("Bank"), file });
    if (fileUploaderRef.current) fileUploaderRef.current.value = "";
    processFeedback(output);
  };

  const processFeedback = (records: ProcessedFeedbackResponse[]) => {
    for (const record of records) {
      if (record.Status === "ERROR") {
        Modals.showMessageBox({ type: "Error", children: record.FeedbackMessage });
        continue;
      }
      if (record.Status !== "FAIL" || record.Canceled === "Y") continue;
      const { close } = Modals.showMessageBox({
        type: "Confirm",
        children: `Payment of Outgoing Payment/Journal ${record.DocNum} failed. Do you want to cancel the payment?`,
        actions: [
          <Button
            design="Emphasized"
            onClick={() => {
              onCancelPayment(record);
              close();
            }}
          >
            Yes
          </Button>,
          <Button onClick={() => close()}>No</Button>,
        ],
      });
    }
  };

  const onCancelPayment = (record: ProcessedFeedbackResponse) => {
    if (record.ObjType === "PV") {
      cancelOutgoingPayment({ docentry: record.DocEntry });
    } else {
      cancelJournalEntry({ docentry: record.DocEntry });
    }
  };

  // ========== EFFECTS
  useEffect(() => {
    if (banks.length > 0 && !selectedBank) {
      setValue("Bank", banks[0].Code);
    }
  }, [banks, selectedBank, setValue]);

  // ========== VIEWS
  return (
    <>
      {isImporting && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.6)",
          }}
        >
          <BusyIndicator active />
        </div>
      )}

      <Form layout="S1 M1 L1 XL1" labelSpan="S12 M12 L12 XL2">
        <FormItem labelContent={<Label>Bank</Label>}>
          <Controller
            name="Bank"
            control={control}
            rules={{ required: "Bank is required" }}
            render={({ field: { value, onChange } }) => (
              <Select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onClose={(e) => onChange(e.target.value)}
              >
                {banks.map((x) => (
                  <Option key={x.Code} value={x.Code}>
                    {x.Name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </FormItem>

        <FormItem labelContent={<Label>Payment Means</Label>}>
          <Controller
            name="Method"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select value={value} onClose={(e) => onChange(e.target.value)}>
                <Option value="I">(Default)</Option>
                <Option value="Q">Cheque</Option>
                <Option value="T">Bank Transfer</Option>
                <Option value="C">Cash</Option>
              </Select>
            )}
          />
        </FormItem>

        {bankSettings?.RequirePayCode === "Y" && (
          <FormItem labelContent={<Label>Payment Code</Label>}>
            <Controller
              name="PayCode"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Input value={value} onChange={onChange} />
              )}
            />
          </FormItem>
        )}

        <FormItem labelContent={<Label>{bankSettings?.U_BaseDate ?? "Posting Date"}</Label>}>
          <Controller
            name="PostDate"
            control={control}
            render={({ field: { value, onChange } }) => (
              <DatePicker value={value} onChange={onChange} />
            )}
          />
        </FormItem>

        <FormItem labelContent={<Label>Doc. Num.</Label>}>
          <FlexBox alignItems="Center" gap={10}>
            <Controller
              name="DocNoFr"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Input type="Number" value={value.toString()} onChange={onChange} />
              )}
            />
            <Label>to</Label>
            <Controller
              name="DocNoTo"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Input type="Number" value={value.toString()} onChange={onChange} />
              )}
            />
          </FlexBox>
        </FormItem>

        <FormItem labelContent={<Label>Payment Draft</Label>}>
          <Controller
            name="Draft"
            control={control}
            render={({ field: { value, onChange } }) => (
              <CheckBox checked={value} onChange={(e) => onChange(e.target.checked)} />
            )}
          />
        </FormItem>

        <FlexBox gap={10} justifyContent="End" alignItems="Center">
          <Button design="Emphasized" onClick={() => handleSubmit(onActionDownload)()}>
            Download
          </Button>
          {bankSettings?.SupportFeedbackFile === "Y" && (
            <FileUploader
              ref={fileUploaderRef}
              hideInput
              valueState="None"
              accept=".txt"
              onChange={onImportFeedback}
            >
              <Button>Import Feedback</Button>
            </FileUploader>
          )}
        </FlexBox>
      </Form>

      <PaymentPreview
        data={getValues()}
        visible={showPayments}
        onActionClose={() => setShowPayments(false)}
      />
    </>
  );
};
