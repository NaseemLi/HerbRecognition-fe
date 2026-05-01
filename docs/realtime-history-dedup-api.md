# 实时识别历史记录去重 — 后端对接文档

## 背景

实时识别模式下，前端每秒调用一次识别接口，后端每次都会自动创建一条历史记录，导致同一药材在短时间内产生大量重复记录。

**目标**：在实时识别模式下，同一药材只保留一条历史记录（按药材去重）。

---

## 接口变更

### `POST /api/recognize/base64`

**新增可选参数**：

| 参数名         | 类型    | 是否必填 | 默认值 | 说明                         |
| -------------- | ------- | -------- | ------ | ---------------------------- |
| `image_base64` | string  | 是       | -      | Base64 编码的图片            |
| `save_history` | boolean | 否       | `true` | 是否在识别成功后保存历史记录 |

**请求示例**：

```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
  "save_history": false
}
```

**行为说明**：

- 当 `save_history` 为 `true` 或未传时：保持现有行为，识别成功后自动创建历史记录。
- 当 `save_history` 为 `false` 时：仅返回识别结果（`herb_id`、`herb_name`、`confidence`、`image_url`），**不写入历史记录表**。`record_id` 字段可返回 `null` 或省略。

**响应格式不变**，示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "record_id": 123,
    "herb_id": 5,
    "herb_name": "人参",
    "confidence": 96.5,
    "image_url": "/uploads/recognize/xxx.jpg"
  }
}
```

当 `save_history: false` 时，`record_id` 可以为 `null`：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "record_id": null,
    "herb_id": 5,
    "herb_name": "人参",
    "confidence": 96.5,
    "image_url": "/uploads/recognize/xxx.jpg"
  }
}
```

---

## 前端行为（供参考）

实时识别模式下，前端的行为逻辑如下：

1. **常规轮询识别**：每秒发送一次请求，`save_history: false`，只获取识别结果用于前端展示。
2. **药材变化时保存**：当前端检测到识别到的 `herb_id` 与上一次保存的不同，再发一次 `save_history: true` 的请求保存新药材记录。
3. **效果**：在一次实时识别会话中，同一种药材只会保存一条历史记录。

**非实时模式**（上传识别、拍照识别）不受影响，继续正常保存历史记录。

---

## 最小改动建议

后端仅需在 `/api/recognize/base64` 的处理逻辑中：

1. 读取请求体中的 `save_history` 字段（布尔值，默认 `true`）。
2. 完成识别后，根据 `save_history` 的值决定是否执行 `history_records.create(...)`。

伪代码示例：

```python
# Python / FastAPI 示例
@router.post("/api/recognize/base64")
def recognize_base64(request: RecognizeBase64Request):
    result = ai_recognize(request.image_base64)

    if request.save_history:
        record = history_records.create(
            user_id=current_user.id,
            herb_id=result.herb_id,
            herb_name=result.herb_name,
            confidence=result.confidence,
            image_url=result.image_url,
        )
        result.record_id = record.id
    else:
        result.record_id = None

    return success_response(result)
```
