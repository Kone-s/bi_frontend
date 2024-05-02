import { PageContainer } from '@ant-design/pro-components';
import '@umijs/max';
import UserManage from "@/pages/admin/user_manage";
import React from 'react';
const Admin: React.FC = () => {
  
  return (
    <PageContainer>
      <UserManage />
    </PageContainer>
  );
};
export default Admin;
