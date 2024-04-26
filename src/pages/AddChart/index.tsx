import { CHART_TYPE } from '@/constants/chart/chartType';
import { genChartByAiUsingPOST } from '@/services/BI/chartController';
import { getUserByIdUsingGet } from '@/services/BI/scoreController';
import { UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Space,
  Spin,
  Select,
  Upload,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import ReactECharts from 'echarts-for-react';
import React, { useState } from 'react';

const AddChart: React.FC = () => {
  // 图表状态，是否有图表结果
  const [chart, setChart] = useState<API.BiResponse>();
  // 提交状态，是否有正在提交
  const [submitting, setSubmitting] = useState<boolean>(false);
  // json解析状态，是否解析成功
  const [option, setOption] = useState<any>();
  const onFinish = async (values: any) => {
    // 避免重复提交
    if (submitting) return;
    setSubmitting(true);
    setChart(undefined);
    setOption(undefined);
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
        const res = await genChartByAiUsingPOST(params, {}, values.file.file.originFileObj);
        if (!res?.data) {
          message.error('分析失败，请重试');
        } else {
          const chartOption = JSON.parse(res.data.genChart ?? '');
          if (!chartOption) {
            throw new Error('图表代码解析错误');
          } else {
            setChart(res?.data);
            setOption(chartOption);
          }
          message.success('分析成功');
        }
      }
    } catch (e: any) {
      message.error('分析失败', e.message);
    }

    setSubmitting(false);
  };

  return (
    <div className={'chart'}>
      <Row gutter={24}>
        <Col span={12}>
          <Card title="分析设置">
            <Form
              labelCol={{ span: 6 }}
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
              <Form.Item name="chartName" label="图表名称">
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
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    disabled={submitting}
                  >
                    提交
                  </Button>
                  <Button htmlType="reset">重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="可视化图表">
            {option ? <ReactECharts option={option} /> : <div>请先上传文件</div>}
            <Spin spinning={submitting} />
          </Card>
        </Col>
        <Divider style={{ border: 'none' }} />
        <Col span={24}>
          <Card title="分析结论">
            {chart?.genResult ?? <div>请先上传文件</div>}
            <Spin spinning={submitting} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default AddChart;
