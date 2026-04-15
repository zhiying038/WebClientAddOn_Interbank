import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { Option, Popover, Select, ShellBar, ShellBarItem } from "@ui5/webcomponents-react";
import { useState } from "react";

const THEMES = [
  { id: "sap_horizon", label: "Morning Horizon" },
  { id: "sap_horizon_dark", label: "Evening Horizon" },
  { id: "sap_horizon_hcb", label: "High Contrast Black" },
  { id: "sap_horizon_hcw", label: "High Contrast White" },
  { id: "sap_fiori_3", label: "Quartz Light" },
  { id: "sap_fiori_3_dark", label: "Quartz Dark" },
];

const SHELL_BAR_ITEM_ID = "theme-selector-trigger";

export const SelectTheme = () => {
  const [theme, setCurrentTheme] = useState("sap_horizon");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleChange = (themeId: string) => {
    setCurrentTheme(themeId);
    setTheme(themeId);
  };

  return (
    <>
      <ShellBar>
        <ShellBarItem
          id={SHELL_BAR_ITEM_ID}
          icon="palette"
          text="Theme"
          onClick={() => setPopoverOpen(true)}
        />
      </ShellBar>
      <Popover
        opener={SHELL_BAR_ITEM_ID}
        open={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        headerText="Select Theme"
      >
        <Select value={theme} onChange={(e) => handleChange(e.target.value)}>
          {THEMES.map((t) => (
            <Option key={t.id} value={t.id}>
              {t.label}
            </Option>
          ))}
        </Select>
      </Popover>
    </>
  );
};
