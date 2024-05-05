import { CHART_TYPE } from '@/constants/chart/chartType';
import { genChartByAiAsyncUsingPOST } from '@/services/BI/chartController';
import { getUserByIdUsingGet } from '@/services/BI/scoreController';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Upload, message, Row, Col, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import React, { useState } from 'react';

const AddChartAsync: React.FC = () => {
  const [form] = useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const onFinish = async (values: any) => {
    // 避免重复提交
    if (submitting) return;
    setSubmitting(true);
    const params = {
      ...values,
      file: undefined,
    };

    try {
      const scoreRes = await getUserByIdUsingGet();
      // @ts-ignore
      if (scoreRes.data < 1) {
        message.error('积分不足，要坚持签到哦或者联系小郭同学');
      } else {
        const res = await genChartByAiAsyncUsingPOST(params, {}, values.file.file.originFileObj);
        if (!res?.data) {
          message.error('分析失败', 2);
        } else {
          message.success('分析任务提交成功，请稍后在我的图表中查看', 2);
          form.resetFields();
        }
      }
    } catch (e: any) {
      message.error('分析失败', e.message);
    }
    setSubmitting(false);
  };

  return (
    <div className={'chart_async'}>
      <Row gutter={24}>
        <Col span={24}>
          <Card title={'分析设置'}>
            <Form
              form={form}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              labelAlign={'left'}
              onFinish={onFinish}
            >
              <Form.Item
                name="goal"
                label="分析目标："
                rules={[{ required: true, message: '请输入分析目标' }]}
              >
                <TextArea allowClear showCount maxLength={150} placeholder="请输入你的分析需求" />
              </Form.Item>
              <Form.Item name="chartName" label="图表名称" rules={[{ required: true, message: '图表名称' }]}>
                <Input placeholder="请输入图表名称" />
              </Form.Item>
              <Form.Item name="chartType" label="图表类型">
                <Select placeholder="请输选择图表类型" options={CHART_TYPE} />
              </Form.Item>
              <Form.Item
                name="file"
                label="原始数据"
                rules={[{ required: true, message: '请上传原始数据' }]}
              // valuePropName="fileList"
              // getValueFromEvent={normFile}
              >
                <Upload name="file" maxCount={1}>
                  <Button icon={<UploadOutlined />}>点击上传</Button>
                </Upload>
              </Form.Item>
              <Form.Item wrapperCol={{ span: 16, offset: 6 }}>
                <Space>
                  <Button type="primary" htmlType="submit">
                    提交
                  </Button>
                  <Button htmlType="reset">重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default AddChartAsync;
