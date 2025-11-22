import { ConfigProvider } from 'antd';
import { CRM_COLORS } from './colors';

export const themeConfig = {
  token: {
    colorPrimary: CRM_COLORS.primary,
    colorSuccess: CRM_COLORS.success,
    colorWarning: CRM_COLORS.warning,
    colorError: CRM_COLORS.error,
    colorInfo: CRM_COLORS.info,
    borderRadius: 8,
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    fontSize: 14,
    lineHeight: 1.5,
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
      fontWeight: 500,
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
      fontSize: 14,
    },
    Form: {
      labelFontSize: 14,
      labelColor: CRM_COLORS.textPrimary,
    },
  },
};