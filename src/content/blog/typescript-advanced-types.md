---
title: "Windows下通过WSL2和Docker本地部署Dify详细教程"
description: "Dify是一款开源的大语言模型应用开发平台，本文详细介绍如何在Windows系统下通过WSL2和Docker快速部署Dify，帮助你本地搭建AI应用开发环境。"
pubDate: 2026-03-05
heroImage: "/images/dify-cover.png"
tags: ["Dify", "Docker", "WSL2", "LLM"]
featured: true
---

# Windows下通过WSL2和Docker本地部署Dify详细教程

> **更新时间**：2026年3月
> **适用系统**：Windows 10 / Windows 11
> **项目简介**：Dify是一款开源的大语言模型（LLM）应用开发平台，支持接入多种大模型，提供可视化的流程编排能力，让你无需编写代码也能快速构建AI应用。

---

## 目录

1. [Dify 简介](#1-dify-简介)
2. [环境准备](#2-环境准备)
3. [安装 WSL2](#3-安装-wsl2)
4. [安装 Docker Desktop](#4-安装-docker-desktop)
5. [安装 Dify](#5-安装-dify)
6. [配置与使用](#6-配置与使用)
7. [常见问题](#7-常见问题)
8. [进阶配置](#8-进阶配置)

---

## 1. Dify 简介

### 1.1 什么是 Dify

Dify 是一个开源的 LLM 应用开发平台，具有以下特点：

- **可视化编排**：通过图形界面编排 AI 应用流程
- **多种模型支持**：支持 OpenAI、Anthropic、阿里云通义千问、DeepSeek 等
- **RAG 引擎**：内置检索增强生成能力
- **Agent 框架**：支持构建 AI 智能体
- **API 部署**：一键将应用部署为 API 服务
- **团队协作**：支持多用户协作

### 1.2 系统要求

- **操作系统**：Windows 10 21H2+ 或 Windows 11
- **内存**：建议 16GB 以上
- **磁盘空间**：至少 50GB 可用空间
- **CPU**：支持虚拟化技术

---

## 2. 环境准备

在开始之前，需要确认你的 Windows 系统满足以下条件：

### 2.1 启用系统虚拟化

1. 重启电脑，按 `F2` 或 `Del`（不同主板按键不同）进入 BIOS
2. 找到 `Virtualization Technology` 或 `Intel VT-x` / `AMD-V` 选项
3. 将其设置为 `Enabled`
4. 保存并退出 BIOS

### 2.2 检查系统信息

按 `Win + R`，输入 `msinfo32`，查看：

- **操作系统版本**：确保是 Windows 10 21H2 或 Windows 11
- **Hyper-V**：确认可用

---

## 3. 安装 WSL2

WSL2（Windows Subsystem for Linux 2）是 Windows 10/11 自带的 Linux 子系统，是运行 Docker 的最佳选择。

### 3.1 以管理员身份打开 PowerShell

1. 按 `Win + S`，搜索 "PowerShell"
2. 右键点击 "Windows PowerShell"，选择 "以管理员身份运行"

### 3.2 安装 WSL2

在 PowerShell 中执行以下命令：

```powershell
# 安装 WSL2 和 Ubuntu
wsl --install

# 如果上面的命令失败，尝试分别安装
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

### 3.3 设置 WSL2 为默认版本

```powershell
wsl --set-default-version 2
```

### 3.4 安装 Ubuntu

```powershell
# 列出可用的 Linux 发行版
wsl --list --online

# 安装 Ubuntu（推荐 Ubuntu 22.04）
wsl --install -d Ubuntu-22.04
```

### 3.5 重启电脑

安装完成后需要重启电脑使 WSL2 生效。

### 3.6 配置 Ubuntu

重启后会自动打开 Ubuntu 终端，设置用户名和密码：

```
Installing, this may take a few minutes...
Please create a default UNIX user account. For more information visit: https://aka.ms/wslusers
Enter new UNIX username: yourname
New password: ********
Retype password: ********
```

### 3.7 换源（国内用户推荐）

```bash
# 备份原文件
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak

# 换用阿里云源
sudo sed -i 's/archive.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list

# 更新软件包
sudo apt update && sudo apt upgrade -y
```

---

## 4. 安装 Docker Desktop

Docker Desktop 是 Docker 在 Windows 上的桌面版，集成了 Docker Engine、Docker CLI 和 Docker Compose。

### 4.1 下载 Docker Desktop

访问 [Docker 官网下载页面](https://www.docker.com/products/docker-desktop/)，下载 Windows 安装包。

### 4.2 安装 Docker Desktop

1. 双击下载的 `.exe` 安装包
2. 勾选 **"Use WSL 2 instead of Hyper-V"**（推荐）
3. 点击 "Install" 开始安装
4. 安装完成后，点击 "Close and restart"

### 4.3 启动 Docker Desktop

1. 启动 Docker Desktop
2. 等待 Docker 服务启动完成（托盘图标变为稳定状态）
3. 打开 WSL2 终端，验证安装：

```bash
docker --version
docker-compose --version
docker ps
```

### 4.4 配置 Docker 镜像加速（国内用户必做）

1. 打开 Docker Desktop
2. 点击右上角设置图标（⚙️）
3. 选择 "Docker Engine"
4. 在编辑器中添加以下配置：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```

5. 点击 "Apply & Restart"

---

## 5. 安装 Dify

### 5.1 克隆 Dify 源码

打开 WSL2 终端，执行：

```bash
# 进入用户目录
cd ~

# 克隆 Dify 源码
git clone https://github.com/langgenius/dify.git

# 进入 docker 目录
cd dify/docker
```

### 5.2 配置环境变量

```bash
# 复制环境配置文件
cp .env.example .env
```

### 5.3 修改配置文件（可选）

如果你使用的是ollama或其他本地模型，需要修改相关配置：

```bash
# 编辑配置文件
nano .env
```

常用配置项：

```bash
# 如果使用本地模型，可配置 Ollama
CODE_EXECUTION_ENDPOINT=http://your-ollama-host:11434

# API Keys（根据你使用的模型服务商配置）
OPENAI_API_KEY=sk-your-api-key
ANTHROPIC_API_KEY=sk-ant-your-api-key

# 通义千问（阿里云）
DASHSCOPE_API_KEY=your-dashscope-key
```

### 5.4 启动 Dify

```bash
# 使用 Docker Compose 启动所有服务
docker-compose up -d

# 或者后台启动
docker-compose up -d
```

### 5.5 等待服务启动

首次启动需要下载 Docker 镜像，请耐心等待（国内可能需要 10-30 分钟）。

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5.6 验证安装

当所有服务都显示为 `healthy` 状态时，打开浏览器访问：

```
http://localhost

或

http://127.0.0.1
```

---

## 6. 配置与使用

### 6.1 初始化管理员账号

首次访问会要求创建管理员账号：

1. 点击 "Sign up"
2. 输入邮箱和密码
3. 点击 "Create account"

### 6.2 创建第一个应用

1. 点击 "Create New App"
2. 选择应用类型：
   - **Chatbot**：对话机器人
   - **Agent**：AI 智能体
   - **Workflow**：工作流编排
   - **Completion**：文本生成

3. 输入应用名称和描述
4. 点击 "Create"

### 6.3 配置模型

1. 进入 "Settings" > "Model Providers"
2. 选择你要使用的模型服务商：
   - **OpenAI**
   - **Anthropic**
   - **阿里云通义千问**
   - **DeepSeek**
   - **Ollama**（本地模型）
3. 填入对应的 API Key
4. 点击 "Save"

### 6.4 发布应用

1. 配置好模型后，点击 "Publish"
2. 应用即可通过 Web 界面或 API 访问

---

## 7. 常见问题

### Q1: Docker Desktop 启动失败

**解决方案**：

1. 确保已启用 WSL2
2. 确保已在 BIOS 中启用虚拟化
3. 重启电脑后重新打开 Docker Desktop

```powershell
# 在 PowerShell 中重置 WSL
wsl --shutdown
wsl --update
```

### Q2: docker-compose up 报错 "port already allocated"

**解决方案**：

```bash
# 停止并删除所有容器
docker-compose down

# 重新启动
docker-compose up -d
```

### Q3: 服务启动后无法访问页面

**解决方案**：

1. 检查所有容器是否都在运行：
   ```bash
   docker-compose ps
   ```

2. 查看日志：
   ```bash
   docker-compose logs -f
   ```

3. 确保 80 端口未被占用：
   ```bash
   netstat -ano | findstr ":80"
   ```

### Q4: 模型调用超时或失败

**解决方案**：

1. 检查 API Key 是否正确配置
2. 检查网络连接是否正常
3. 如果是本地模型，确认 Ollama 服务已启动：
   ```bash
   curl http://localhost:11434
   ```

### Q5: 存储空间不足

**解决方案**：

1. 清理未使用的 Docker 资源：
   ```bash
   docker system prune -a
   ```

2. 移动 Docker 镜像到其他磁盘（需要修改 Docker Desktop 配置）

---

## 8. 进阶配置

### 8.1 配置中文界面

Dify 默认是英文界面，可在用户设置中切换语言：

1. 点击右上角头像
2. 选择 "Settings"
3. 在 "Language" 中选择 "简体中文"

### 8.2 配置外部数据库（可选）

Dify 默认使用 SQLite，如果你需要更强大的数据库：

**使用 PostgreSQL**：

修改 `.env` 文件：

```bash
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=dify
```

**使用 Redis 外部服务**：

```bash
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### 8.3 配置 HTTPS（可选）

如果你需要通过 HTTPS 访问：

1. 使用 Nginx 反向代理
2. 配置 SSL 证书
3. 修改 `docker-compose.yaml` 中的端口映射

### 8.4 备份与恢复

**备份**：

```bash
# 备份数据卷
docker run --rm -v dify-db-data:/data -v $(pwd):/backup ubuntu tar czf /backup/dify-backup.tar.gz /data
```

**恢复**：

```bash
# 停止服务
docker-compose down

# 恢复数据
docker run --rm -v dify-db-data:/data -v $(pwd):/backup ubuntu tar xzf /backup/dify-backup.tar.gz -C /

# 重启服务
docker-compose up -d
```

---

## 总结

通过以上步骤，你已经在 Windows 系统上成功部署了 Dify。现在你可以：

- 创建 AI 对话应用
- 构建 RAG 知识库
- 设计复杂的 AI 工作流
- 通过 API 集成到其他应用

如果在使用过程中遇到问题，欢迎在评论区留言或访问 [Dify 官方文档](https://docs.dify.ai/) 获取更多帮助。

**祝使用愉快！**
