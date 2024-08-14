"use client";

import { Button, Col, Form, InputNumber, Row, Select, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import TitleCustom from "../components/TitleCustom";
import { useLoading } from "../contexts/LoadingContext";

const { Paragraph } = Typography;
const { Option } = Select;

export default function Analysis() {
  const [analysis, setAnalysis] = useState("");
  const [form] = Form.useForm();
  const { setLoading } = useLoading();
  const [currentLevel, setCurrentLevel] = useState("Mega-Sena");

  const formRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({
          jobDescription: values.jobDescription,
          currentLevel: values.currentLevel,
          currentStack: values.currentStack,
          technologies: values.technologies,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Erro ao enviar análise:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLevelChange = (value: string) => {
    setCurrentLevel(value);
    form.setFieldsValue({
      currentStack: value === "Mega-Sena" ? 6 : 15,
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      currentLevel: currentLevel,
      currentStack: currentLevel === "Mega-Sena" ? 6 : 15,
    });
  }, [form, currentLevel]);

  return (
    <>
      <Row justify="space-between" align="middle">
        <Col>
          <TitleCustom text="Análise de Jogo" />
        </Col>
      </Row>
      <Paragraph>
        Utilize o formulário abaixo para fornecer informações sobre o seu tipo
        de jogo, quantos números e quantos jogos você deseja fazer.
      </Paragraph>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span={12}>
          <div ref={formRef}>
            <Form
              form={form}
              layout="vertical"
              style={{ marginBottom: "24px" }}
              initialValues={{
                currentLevel: currentLevel,
                currentStack: currentLevel === "Mega-Sena" ? 6 : 15,
                technologies: 1,
              }}
            >
              <Form.Item label="Tipo de Jogo" name="currentLevel">
                <Select
                  placeholder="Selecione seu nível atual"
                  onChange={handleCurrentLevelChange}
                  value={currentLevel}
                  style={{ width: "100%" }}
                >
                  <Option value="Mega-Sena">Mega-Sena</Option>
                  <Option value="Lotofacil">Lotofacil</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Quantidade de números" name="currentStack">
                <InputNumber
                  min={currentLevel === "Mega-Sena" ? 6 : 15}
                  max={20}
                  placeholder="Selecione a quantidade de números"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label="Selecione a quantidade de jogos"
                name="technologies"
              >
                <InputNumber
                  min={1}
                  placeholder="Selecione a quantidade de jogos"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Form>
            <Button
              type="primary"
              onClick={handleAnalyze}
              style={{ marginTop: "16px" }}
            >
              Simular Jogos
            </Button>
          </div>
        </Col>
        <Col style={{ marginTop: "28px" }} span={12} ref={contentRef}>
          <div
            style={{
              width: "100%",
              height: "490px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              padding: "10px",
              overflowY: "auto",
            }}
          >
            {analysis ? (
              <ReactMarkdown>{analysis}</ReactMarkdown>
            ) : (
              <div
                style={{ color: "#888", textAlign: "center", padding: "20px" }}
              >
                <p>
                  As análises detalhadas dos jogos seram exibidas aqui. Por
                  favor, preencha o formulário ao lado e clique no botão
                  `Simular Jogos` para obter a análise.
                </p>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
}
