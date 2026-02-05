# SaveHomelessKitty

## Deploy:

1. Download .NET 10 SDK

```
https://dotnet.microsoft.com/en-us/download
```

2. Download Node.js

```
https://nodejs.org/en/download
```

3. configure npm mirror

```
yarn config set registry https://mirrors.cloud.tencent.com/npm/
```

4. Install pnpm

```
npm install -g pnpm
```

5. Clone Repo

```
git clone https://github.com/PLFJY/SaveHomelessKitty.git
cd SaveHomelessKitty
```

6. Install requirements & run 

```
cd web
pnpm i
```

6. Run Backend
```
dotnet run --project .\SaveHomelessKitty\SaveHomelessKitty.csproj
```