.class Lcom/signhere/offline/MainActivity$2;
.super Landroid/webkit/WebChromeClient;
.source "MainActivity.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Lcom/signhere/offline/MainActivity;->onCreate(Landroid/os/Bundle;)V
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic this$0:Lcom/signhere/offline/MainActivity;


# direct methods
.method constructor <init>(Lcom/signhere/offline/MainActivity;)V
    .locals 0

    .line 58
    iput-object p1, p0, Lcom/signhere/offline/MainActivity$2;->this$0:Lcom/signhere/offline/MainActivity;

    invoke-direct {p0}, Landroid/webkit/WebChromeClient;-><init>()V

    return-void
.end method


# virtual methods
.method public onConsoleMessage(Landroid/webkit/ConsoleMessage;)Z
    .locals 2

    .line 60
    invoke-virtual {p1}, Landroid/webkit/ConsoleMessage;->messageLevel()Landroid/webkit/ConsoleMessage$MessageLevel;

    move-result-object v0

    sget-object v1, Landroid/webkit/ConsoleMessage$MessageLevel;->ERROR:Landroid/webkit/ConsoleMessage$MessageLevel;

    if-ne v0, v1, :cond_0

    .line 61
    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {p1}, Landroid/webkit/ConsoleMessage;->message()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    const-string v1, " @"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {p1}, Landroid/webkit/ConsoleMessage;->lineNumber()I

    move-result p1

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    move-result-object p1

    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    const-string v0, "SignHereOffline"

    invoke-static {v0, p1}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;)I

    .line 62
    :cond_0
    const/4 p1, 0x1

    return p1
.end method

.method public onShowFileChooser(Landroid/webkit/WebView;Landroid/webkit/ValueCallback;Landroid/webkit/WebChromeClient$FileChooserParams;)Z
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/webkit/WebView;",
            "Landroid/webkit/ValueCallback<",
            "[",
            "Landroid/net/Uri;",
            ">;",
            "Landroid/webkit/WebChromeClient$FileChooserParams;",
            ")Z"
        }
    .end annotation

    .line 66
    iget-object p1, p0, Lcom/signhere/offline/MainActivity$2;->this$0:Lcom/signhere/offline/MainActivity;

    invoke-static {p1}, Lcom/signhere/offline/MainActivity;->access$200(Lcom/signhere/offline/MainActivity;)Landroid/webkit/ValueCallback;

    move-result-object p1

    const/4 v0, 0x0

    if-eqz p1, :cond_0

    iget-object p1, p0, Lcom/signhere/offline/MainActivity$2;->this$0:Lcom/signhere/offline/MainActivity;

    invoke-static {p1}, Lcom/signhere/offline/MainActivity;->access$200(Lcom/signhere/offline/MainActivity;)Landroid/webkit/ValueCallback;

    move-result-object p1

    invoke-interface {p1, v0}, Landroid/webkit/ValueCallback;->onReceiveValue(Ljava/lang/Object;)V

    .line 67
    :cond_0
    iget-object p1, p0, Lcom/signhere/offline/MainActivity$2;->this$0:Lcom/signhere/offline/MainActivity;

    invoke-static {p1, p2}, Lcom/signhere/offline/MainActivity;->access$202(Lcom/signhere/offline/MainActivity;Landroid/webkit/ValueCallback;)Landroid/webkit/ValueCallback;

    .line 69
    const/4 p1, 0x1

    :try_start_0
    iget-object v1, p0, Lcom/signhere/offline/MainActivity$2;->this$0:Lcom/signhere/offline/MainActivity;

    invoke-virtual {p3}, Landroid/webkit/WebChromeClient$FileChooserParams;->createIntent()Landroid/content/Intent;

    move-result-object p3

    invoke-virtual {v1, p3, p1}, Lcom/signhere/offline/MainActivity;->startActivityForResult(Landroid/content/Intent;I)V
    :try_end_0
    .catch Landroid/content/ActivityNotFoundException; {:try_start_0 .. :try_end_0} :catch_0

    .line 73
    goto :goto_0

    .line 70
    :catch_0
    move-exception p3

    .line 71
    iget-object p3, p0, Lcom/signhere/offline/MainActivity$2;->this$0:Lcom/signhere/offline/MainActivity;

    invoke-static {p3, v0}, Lcom/signhere/offline/MainActivity;->access$202(Lcom/signhere/offline/MainActivity;Landroid/webkit/ValueCallback;)Landroid/webkit/ValueCallback;

    .line 72
    invoke-interface {p2, v0}, Landroid/webkit/ValueCallback;->onReceiveValue(Ljava/lang/Object;)V

    .line 74
    :goto_0
    return p1
.end method
