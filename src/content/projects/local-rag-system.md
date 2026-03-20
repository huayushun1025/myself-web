---
title: "本地大模型知识库问答系统"
description: "基于 Ollama 和 RAG 技术构建的本地向量知识库系统，支持私有文档的智能问答，保护数据隐私。"
date: 2026-03-05
heroImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop"
tags: ["Ollama", "LangChain", "RAG", "向量数据库", "Python"]
demo: "https://demo.local-llm.com"
repo: "https://github.com/example/local-rag-system"
featured: true
---

## 项目背景

在企业场景中，经常需要基于私有文档进行问答。传统的云端方案存在数据安全和成本问题。本项目探索在本地运行 LLM + RAG 的可行方案。

## 技术方案

### 整体架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   文档上传    │────▶│  文本分割    │────▶│   向量化    │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   答案展示    │◀────│  LLM 生成   │◀────│  相似度检索  │
└─────────────┘     └─────────────┘     └─────────────┘
                           ▲
                           │
                    ┌─────────────┐
                    │   Ollama   │
                    │  (本地 LLM) │
                    └─────────────┘
```

### 核心组件

1. **文档处理**：支持 PDF、Word、Markdown 等格式
2. **文本分割**：基于语义的分块策略
3. **向量存储**：Chroma DB 本地向量数据库
4. **检索增强**：Hybrid Search (向量 + 关键词)
5. **LLM 生成**：Ollama 支持的多种模型

## 关键代码

### 文档向量化

```python
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma

# 加载文档
loader = PyPDFLoader("document.pdf")
documents = loader.load()

# 文本分割
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)
chunks = splitter.split_documents(documents)

# 向量化
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-large-zh-v1.5"
)

# 存储到 Chroma
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)
```

### RAG 问答

```python
from langchain.chat_models import ChatOllama
from langchain.chains import RetrievalQA

# 初始化 Ollama
llm = ChatOllama(
    model="llama2:7b-chat-q4_0",
    temperature=0.7
)

# 创建 QA Chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(),
    return_source_documents=True
)

# 问答
result = qa_chain({"query": "文档中提到的核心技术方案是什么？"})
print(result["result"])
```

## 性能优化

### 模型量化

| 模型 | 量化级别 | 显存需求 | 质量评分 |
|------|---------|---------|---------|
| Llama 2 7B | Q4_0 | ~4GB | 85 |
| Llama 2 7B | Q5_1 | ~5GB | 90 |
| Mistral 7B | Q4_0 | ~4GB | 88 |

### 批处理优化

对于大量文档处理，使用批处理提升效率：

```python
# 批量向量化
for batch in tqdm(list(batches)):
    embeddings = embed_model.embed_documents(batch)
    vectorstore.add_vectors(embeddings, batch)
```

## 使用场景

- 企业内部知识库
- 私有文档问答
- 技术文档助手
- 合同分析审核

## 部署要求

- **最低配置**：16GB RAM + 6GB GPU
- **推荐配置**：32GB RAM + 10GB GPU
- **存储**：根据文档量，约 1GB/千页
