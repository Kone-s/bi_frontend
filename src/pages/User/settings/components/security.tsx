import { sendForgetCaptchaUsingPost, userForgetUsingPost } from '@/services/BI/userController';
import { CommentOutlined, LockOutlined, TwitchOutlined } from '@ant-design/icons';
import { ProFormCaptcha, ProFormText } from '@ant-design/pro-components';
import { Button, Form, List, message, Modal, Tabs } from 'antd';
import React, { useState } from 'react';

type Unpacked<T> = T extends (infer U)[] ? U : T;

const passwordStrength = {
  strong: <span className="strong">强</span>,
  medium: <span className="medium">中</span>,
  weak: <span className="weak">弱 Weak</span>,
};

const SecurityView: React.FC = () => {
  const [isModalVisibleForget, setModalVisibleForget] = useState(false);
  const [form] = Form.useForm();
  const [type, setType] = useState<string>('account');

  const handleForget = () => {
    setModalVisibleForget(true);
  };

  const handleSaveForget = async () => {
    try {
      const forget: API.UserForgetRequest = {
        userEmail: form.getFieldValue('userEmail'),
        userPassword: form.getFieldValue('userPassword'),
        checkPassword: form.getFieldValue('checkPassword'),
        captcha: form.getFieldValue('captcha'),
      }
      // 注册
      const res = await userForgetUsingPost(forget);
      if (res.code === 0) {
        message.success('修改成功！');
        setModalVisibleForget(false)
        return;
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      message.error('修改失败，请重试！');
    }
  }

  const handleGetCaptchaForget = async () => {
    try {
      const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      const userEmail = form?.getFieldValue('userEmail');
      if (emailRegex.test(userEmail)) {
        const res = await sendForgetCaptchaUsingPost({
          userEmail: userEmail,
        })
        if (res.code === 0) {
          message.success("验证码已发送至邮箱,请注意查收！");
        }
      }
    } catch (error: any) {
      message.error("校验码发送失败");
    }
  };

  const getData = () => [
    {
      title: '账户密码',
      description: (
        <>
          当前密码强度：
          {passwordStrength.strong}
        </>
      ),
      actions: [<Button type="link" key="Modify" onClick={handleForget}>修改</Button>],
    },
    {
      title: '密保问题',
      description: '未设置密保问题，密保问题可有效保护账户安全',
      actions: [<Button type="link" key="Modify" >设置</Button>],
    }
  ];

  const data = getData();
  return (
    <>
      <List<Unpacked<typeof data>>
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item actions={item.actions}>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
      <Modal
        title="修改密码"
        open={isModalVisibleForget}
        onOk={handleSaveForget}
        onCancel={() => setModalVisibleForget(false)}
      >
        <Form form={form} layout="vertical">
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '修改密码',
              },
            ]}
          />
          <>
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: <CommentOutlined />,
              }}
              name="userEmail"
              placeholder={'请输入邮箱'}
              rules={[
                {
                  required: true,
                  message: '邮箱是必填项！',
                },
                {
                  pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                  message: '不合法的邮箱！',
                },
              ]}
            />
            <ProFormCaptcha
              fieldProps={{
                size: 'large',
                prefix: <TwitchOutlined className={'prefixIcon'} />,
              }}
              captchaProps={{
                size: 'large',
              }}
              placeholder={'请输入验证码'}
              captchaTextRender={(timing, count) => {
                if (timing) {
                  return `${count} ${'后重新获取'}`;
                }
                return '获取验证码';
              }}
              name="captcha"
              rules={[
                {
                  required: true,
                  message: '请输入6位验证码！',
                }
              ]}
              onGetCaptcha={handleGetCaptchaForget}
            />
            <ProFormText.Password
              name="userPassword"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder={'请输入密码'}
              rules={[
                {
                  required: true,
                  message: '密码是必填项！',
                },
                {
                  min: 8,
                  message: '密码不少于8位',
                },
              ]}
            />
            <ProFormText.Password
              name="checkPassword"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder={'请再次输入密码'}
              rules={[
                {
                  required: true,
                  message: '密码是必填项！',
                },
                {
                  min: 8,
                  message: '密码不少于8位',
                },
              ]}
            />
          </>
        </Form>
      </Modal>
    </>
  );
};

export default SecurityView;
