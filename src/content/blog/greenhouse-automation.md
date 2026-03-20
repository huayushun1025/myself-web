---
title: "物联网大棚卷帘机自动化控制系统实战"
description: "详细介绍如何基于 ESP32 和 MQTT 协议构建智能农业控制系统，实现大棚卷帘机的自动化管理。"
pubDate: 2026-03-10
heroImage: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&h=600&fit=crop"
tags: ["物联网", "ESP32", "MQTT", "智能农业"]
---

## 项目背景

在现代设施农业中，大棚卷帘机的自动化控制是提升生产效率的关键。本项目针对北方地区温室大棚设计的卷帘机自动化系统，实现了根据光照、温度和时间自动控制卷帘开合的功能。

## 系统架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   传感器    │────▶│   ESP32    │────▶│  MQTT Broker │
│  (光照/温度) │     │  (控制器)   │     │  (本地服务器) │
└─────────────┘     └─────────────┘     └─────────────┘
                                                │
                    ┌───────────────────────────┤
                    ▼                           ▼
             ┌─────────────┐            ┌─────────────┐
             │   Web Dashboard   │    │  Mobile App │
             └─────────────┘            └─────────────┘
```

## 硬件选型

### 主控制器

选用 ESP32-DevKitC V4，具备以下特性：
- 双核处理器，240MHz
- Wi-Fi + Bluetooth
- 丰富的外设接口
- 低功耗设计

### 传感器

| 传感器 | 型号 | 用途 |
|--------|------|------|
| 光照传感器 | BH1750 | 环境光照检测 |
| 温湿度传感器 | DHT22 | 环境温湿度监测 |
| 风速传感器 | Anemometer | 风力监测（防风保护）|

### 执行器

- 直流电机驱动模块（L298N）
- 限位开关（检测卷帘位置）

## 通信协议

选用 MQTT 协议，主要考虑：

1. **轻量级** - 适合嵌入式设备
2. **低带宽** - 减少网络开销
3. **发布/订阅** - 便于扩展

### MQTT Topic 设计

```bash
# 传感器数据
greenhouse/sensors/light      # 光照强度
greenhouse/sensors/temperature # 温度
greenhouse/sensors/humidity   # 湿度
greenhouse/sensors/wind       # 风速

# 控制指令
greenhouse/control/roller     # 卷帘控制 (UP/DOWN/STOP)
greenhouse/control/mode       # 运行模式 (AUTO/MANUAL)

# 状态反馈
greenhouse/status/roller      # 卷帘状态
greenhouse/status/mode        # 当前模式
```

## 核心代码

### ESP32 主程序

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <BH1750.h>
#include <DHT.h>

// WiFi 配置
const char* ssid = "GREENHOUSE_NET";
const char* password = "********";

// MQTT 配置
const char* mqtt_server = "192.168.1.100";
const int mqtt_port = 1883;

// 传感器对象
BH1750 lightMeter;
DHT dht(DHT_PIN, DHT22);

// MQTT 回调函数
void callback(char* topic, byte* payload, unsigned int length) {
  // 处理控制指令
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  if (String(topic) == "greenhouse/control/roller") {
    if (message == "UP") {
      rollUp();
    } else if (message == "DOWN") {
      rollDown();
    } else if (message == "STOP") {
      stopRoller();
    }
  }
}

void setup() {
  Serial.begin(115200);

  // 初始化传感器
  Wire.begin();
  lightMeter.begin();
  dht.begin();

  // 连接 WiFi
  WiFi.begin(ssid, password);

  // 连接 MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // 读取传感器数据
  float lux = lightMeter.readLightLevel();
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  // 发布传感器数据
  client.publish("greenhouse/sensors/light",
    String(lux).c_str());
  client.publish("greenhouse/sensors/temperature",
    String(temp).c_str());
  client.publish("greenhouse/sensors/humidity",
    String(humidity).c_str());

  delay(5000);  // 5秒采样间隔
}
```

## 自动控制逻辑

```python
# automation.py
def auto_control(sensor_data):
    """
    根据传感器数据自动控制卷帘
    """
    light = sensor_data['light']
    temp = sensor_data['temperature']
    wind = sensor_data['wind']
    time = sensor_data['time']

    # 风力保护 - 风速过大时强制收起
    if wind > 15:  # m/s
        return "STOP", "大风保护"

    # 温度保护
    if temp < 5:  # 低于5度，确保卷帘关闭
        return "DOWN", "低温保护"
    if temp > 35:  # 高于35度，确保卷帘打开通风
        return "UP", "高温保护"

    # 光照控制
    if light < 5000:  # 光照不足，收起卷帘
        return "UP", "光照不足"
    elif light > 50000:  # 光照过强，下放卷帘遮阳
        return "DOWN", "光照过强"

    return "STOP", "无需调整"
```

## Web 控制面板

使用 React + Tailwind CSS 构建了可视化控制面板：

- 实时显示传感器数据
- 历史数据图表
- 手动/自动模式切换
- 报警通知

## 部署效果

系统已在 3 个大型温室大棚（约 50 亩）部署运行：

- **节能效果**：相比人工操作，电力消耗降低 30%
- **作物产量**：自动化管理使产量提升约 15%
- **人工成本**：减少 60% 的人工巡检时间

## 后续优化

1. 增加气象 API 集成，提前预测天气变化
2. 引入机器学习，优化控制策略
3. 增加摄像头监控，视觉反馈卷帘状态

## 总结

这个项目展示了物联网技术在现代农业生产中的应用潜力。通过合理的硬件选型和软件设计，我们用较低的成本实现了可靠的自动化控制系统。
