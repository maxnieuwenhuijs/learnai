import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { AlertCircle, CheckCircle, Info, User, Settings, Home, ChevronRight } from 'lucide-react';

export function ComponentsTest() {
  const [progress, setProgress] = useState(33);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">shadcn/ui Components Test Page</h1>
          <p className="text-gray-600">Testing all components to ensure they're styled properly</p>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Different button variants and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Home className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled>Disabled</Button>
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                With Icon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and labels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input 
                type="email" 
                id="email" 
                placeholder="Enter your email"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <p className="text-sm text-gray-500">You typed: {inputValue}</p>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input type="password" id="password" placeholder="Enter password" />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input disabled id="disabled" placeholder="This is disabled" />
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Example 1</CardTitle>
              <CardDescription>This is a card description</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Card content goes here. This is a basic card with header, content, and footer.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Card Action</Button>
            </CardFooter>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-blue-900">Styled Card</CardTitle>
              <CardDescription className="text-blue-700">Custom colored card</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800">This card has custom colors applied using Tailwind classes.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Secondary Action</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Indicators</CardTitle>
            <CardDescription>Different progress states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Progress (33%)</Label>
              <Progress value={progress} className="w-full" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>-10%</Button>
                <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>+10%</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Completed (100%)</Label>
              <Progress value={100} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label>Just Started (10%)</Label>
              <Progress value={10} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Different badge variants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge className="bg-green-500">Custom Color</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Avatars */}
        <Card>
          <CardHeader>
            <CardTitle>Avatars</CardTitle>
            <CardDescription>User avatars with fallbacks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-16 w-16">
                <AvatarFallback>LG</AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tabs Component</CardTitle>
            <CardDescription>Tabbed interface</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                <TabsTrigger value="tab3">Tab 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <Card>
                  <CardHeader>
                    <CardTitle>Tab 1 Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>This is the content for the first tab.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tab2">
                <Card>
                  <CardHeader>
                    <CardTitle>Tab 2 Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>This is the content for the second tab.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tab3">
                <Card>
                  <CardHeader>
                    <CardTitle>Tab 3 Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>This is the content for the third tab.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Different alert styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Default Alert</AlertTitle>
              <AlertDescription>
                This is a default alert with an info icon.
              </AlertDescription>
            </Alert>
            
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your operation completed successfully.
              </AlertDescription>
            </Alert>
            
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong. Please try again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Separator */}
        <Card>
          <CardHeader>
            <CardTitle>Separators</CardTitle>
            <CardDescription>Visual dividers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">Section 1</h4>
                <p className="text-sm text-muted-foreground">Content for section 1</p>
              </div>
              <Separator className="my-4" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">Section 2</h4>
                <p className="text-sm text-muted-foreground">Content for section 2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Combined Example */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Complete Example</CardTitle>
                <CardDescription>Combining multiple components</CardDescription>
              </div>
              <Badge variant="secondary">Featured</Badge>
            </div>
          </CardHeader>
          <CardContent className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">Test Course</h3>
                <p className="text-sm text-gray-500">Your progress in this course</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <Progress value={65} />
            <p className="text-sm text-gray-600">You've completed 65% of this course</p>
            <Separator />
            <div className="flex gap-2">
              <Button className="flex-1">Continue Learning</Button>
              <Button variant="outline" className="flex-1">View Details</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}