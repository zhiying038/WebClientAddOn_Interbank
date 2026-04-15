import { Bar, Button, Dialog, Input, Label } from "@ui5/webcomponents-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

type Props = {
  open: boolean;
  defaultValue: string;
  onConfirm: (paymentType: string) => void;
  onClose: () => void;
};

export const PaymentTypeDialog: React.FC<Props> = ({ open, defaultValue, onConfirm, onClose }) => {
  const { control, handleSubmit, reset } = useForm<{ paymentType: string }>();

  useEffect(() => {
    if (open) reset({ paymentType: defaultValue });
  }, [open, defaultValue, reset]);

  const onSubmit = handleSubmit(({ paymentType }) => onConfirm(paymentType));

  // ========== VIEWS
  return (
    <Dialog
      open={open}
      headerText="Edit Payment Type"
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Emphasized" onClick={() => void onSubmit()}>
                OK
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </>
          }
        />
      }
    >
      <Label>Payment Type</Label>
      <Controller
        name="paymentType"
        control={control}
        render={({ field: { value, onChange } }) => (
          <Input
            value={value}
            onInput={(e) => onChange((e.target as unknown as { value: string }).value)}
          />
        )}
      />
    </Dialog>
  );
};
